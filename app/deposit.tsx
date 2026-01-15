import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { router } from "expo-router";
import {
  useFetchPaymentMethodsQuery,
  useInitiateDepositMutation,
} from "@/store/services/wallet.service";
import Input from "@/components/inputs/Input";
import { useAppSelector } from "@/hooks/useAppDispatch";
import environmentConfig from "@/store/services/configs/environment.config";
import { showToast, TOAST_TYPE_ENUM } from "@/utils/toast";

const deposit = () => {
  const { user } = useAppSelector((state) => state.user);
  const [initiateDeposit, { isLoading: isDepositing }] =
    useInitiateDepositMutation();
  const { data, isLoading, isSuccess } = useFetchPaymentMethodsQuery();
  const [selectedIdx, setSelectedIdx] = useState<{
    idx: number;
    data_id: string | number;
    specifier: string;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const balance = user?.availableBalance || 0;
  
  // Move all hooks to top level - BEFORE any conditional returns
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isSuccess && !data?.data) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "No Payment Methods",
        description: "No payment methods available at the moment.",
      });

      router.back();
    }
  }, [isSuccess, data, selectedIdx]);

  useEffect(() => {
    if (isLoading || !data?.data) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pulseAnim, isLoading, data]);

  // NOW we can do conditional rendering after all hooks are called
  if (isLoading || !data?.data) {
    // Animated skeleton loader cards for payment methods

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "rgb(6,0,25)",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <View
          style={{
            height: 64,
            width: "100%",
            backgroundColor: "#181a20",
            borderBottomWidth: 1,
            borderBottomColor: "#232733",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          {[1, 2, 3].map((_, idx) => (
            <Animated.View
              key={idx}
              style={{
                width: 100,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#232733",
                marginRight: 16,
                opacity: pulseAnim,
              }}
            />
          ))}
        </View>
        <ScrollView style={{ width: "100%" }}>
          <View style={{ padding: 18 }}>
            <Animated.View
              style={{
                width: 120,
                height: 18,
                borderRadius: 4,
                backgroundColor: "#232733",
                marginBottom: 16,
                opacity: pulseAnim,
              }}
            />
            <Animated.View
              style={{
                width: "100%",
                height: 48,
                borderRadius: 8,
                backgroundColor: "#232733",
                marginBottom: 16,
                opacity: pulseAnim,
              }}
            />
            <Animated.View
              style={{
                width: "100%",
                height: 48,
                borderRadius: 8,
                backgroundColor: "#232733",
                marginBottom: 18,
                opacity: pulseAnim,
              }}
            />
            <Animated.View
              style={{
                width: "100%",
                height: 80,
                borderRadius: 6,
                backgroundColor: "#232733",
                opacity: pulseAnim,
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  const paymentMethods = data.data;
  const minAmount = 100;
  const maxAmount = 9999999;

  // Deposit handler based on provided flow
  const handleDeposit = async () => {
    if (isDepositing) return;
    const selectedMethod = paymentMethods[selectedIdx?.idx || 0];
    try {
      const payload = {
        amount: Number(amount),
        paymentMethod: selectedMethod?.title,
        clientId: String(environmentConfig.CLIENT_ID!),
      };
      const res = await initiateDeposit(payload).unwrap();
      if (res.success) {
        if (selectedMethod?.title === "fidelity") {
          try {
            const payazaConfig = JSON.parse(Object.values(res.data)[0]);
            // @ts-ignore
            // const payazaCheckout = global.PayazaCheckout?.setup({
            //   ...payazaConfig,
            //   merchant_key: process.env.EXPO_PUBLIC_PAYAZA_MERCHANT_KEY,
            //   callback: function (response) {
            //     if (response.type === "success") {
            //       showToast({
            //         type: TOAST_TYPE_ENUM.SUCCESS,
            //         title: "Payment successful!",
            //         description: "Your deposit was successful.",
            //       });
            //       // router.push({
            //       //   pathname: "/payment-verification/fidelity",
            //       //   params: { txnRef: res.data.transactionRef },
            //       // });
            //     } else {
            //       showToast({
            //         type: TOAST_TYPE_ENUM.ERROR,
            //         title: "Payment failed",
            //         description:
            //           response.message || "Payment failed. Please try again.",
            //       });
            //     }
            //   },
            // });
            // payazaCheckout?.showPopup();
          } catch (error) {
            showToast({
              type: TOAST_TYPE_ENUM.ERROR,
              title: "Failed to initialize payment",
              description: "Please try again.",
            });
          }
        } else if (selectedMethod?.title === "sbengine") {
          showToast({
            type: TOAST_TYPE_ENUM.SUCCESS,
            title: "Deposit Code",
            // description: `Deposit code: ${res.data.transactionRef}`,
          });
          // Optionally open a modal or navigate
        } else {
          if (res.data.link === "ACCEPTED") {
            showToast({
              type: TOAST_TYPE_ENUM.SUCCESS,
              title: "Deposit Accepted",
              description: "Deposit accepted successfully.",
            });
            router.replace("/");
          } else if (!res.data.link.includes("http")) {
            showToast({
              type: TOAST_TYPE_ENUM.ERROR,
              title: "Deposit Error",
              description: res.message,
            });
          } else {
            // For external links, you may want to use Linking.openURL
            showToast({
              type: TOAST_TYPE_ENUM.INFO,
              title: "Redirecting",
              description: "Opening payment link...",
            });
            // import { Linking } from 'react-native'; at the top if not already
            // Linking.openURL(res.data.link);
          }
        }
      } else {
        showToast({
          type: TOAST_TYPE_ENUM.ERROR,
          title: "Deposit Failed",
          description:
            res.message || "Failed to initiate deposit. Please try again.",
        });
      }
    } catch (error) {
      showToast({
        type: TOAST_TYPE_ENUM.ERROR,
        title: "Error",
        description: "An error occurred. Please try again.",
      });
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgb(6,0,25)",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <View
        style={{
          height: 64,
          width: "100%",
          backgroundColor: "#181a20",
          borderBottomWidth: 1,
          borderBottomColor: "#232733",
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {paymentMethods.map((method, idx) => (
            <TouchableOpacity
              key={method.id}
              activeOpacity={0.7}
              onPress={() =>
                setSelectedIdx({
                  idx: idx,
                  data_id: method.id,
                  specifier: method.title,
                })
              }
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedIdx?.idx === idx && styles.tabTextSelected,
                ]}
              >
                {method.title}
              </Text>
              {selectedIdx?.idx === idx && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView>
        <View style={styles.contentContainer}>
          <Text style={styles.balanceLabel}>
            Balance (₦){" "}
            <Text style={styles.balanceValue}>{balance.toFixed(2)}</Text>
          </Text>
          <Input
            label="Amount (₦)"
            value={amount}
            onChangeText={setAmount}
            type="num_select"
            num_select_placeholder={`min. ${minAmount}`}
            keyboardType="numeric"
            wrapperStyle={styles.inputWrapper}
            inputStyle={styles.input}
          />
          <TouchableOpacity
            style={[styles.topUpButton, isDepositing && { opacity: 0.6 }]}
            activeOpacity={0.8}
            onPress={handleDeposit}
            disabled={isDepositing}
          >
            <Text style={styles.topUpButtonText}>
              {isDepositing ? "Processing..." : "Top Up Now"}
            </Text>
          </TouchableOpacity>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              1. Minimum deposit amount is ₦ 100 - you can deposit at least ₦
              100 in one transaction.{"\n"}
              2. Maximum per transaction is ₦ 9,999,999.00 - you can deposit up
              to ₦ 9,999,999.00 in one transaction.{"\n"}
              3. If you have any issues, please contact customer service.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default deposit;

const styles = StyleSheet.create({
  tabBar: {
    width: "100%",
    backgroundColor: "#181a20",
    borderBottomWidth: 1,
    borderBottomColor: "#232733",
    height: 48,
  },
  tabBarContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabButton: {
    minWidth: 120,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "#181a20",
  },
  tabText: {
    color: "#e0e0e0",
    fontWeight: "600",
    fontSize: 15,
  },
  tabTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "#C72C3B",
  },
  contentContainer: {
    flex: 1,
    padding: 18,
    backgroundColor: "#181a20",
    width: "100%",
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 8,
  },
  balanceValue: {
    color: "#fff",
    fontWeight: "bold",
  },
  inputWrapper: {
    marginBottom: 16,
    backgroundColor: "#232733",
    borderColor: "#232733",
  },
  input: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  topUpButton: {
    backgroundColor: "#C72C3B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  topUpButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  infoBox: {
    backgroundColor: "#10131a",
    borderRadius: 6,
    padding: 16,
  },
  infoText: {
    color: "#bfc9d1",
    fontSize: 15,
    lineHeight: 22,
  },
});
