import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fontisto, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { useModal } from "@/hooks/useModal";
import { router } from "expo-router";
import Footer from "@/components/layouts/Footer";
import { ScrollView } from "react-native-gesture-handler";
import CurrencyFormatter from "@/components/inputs/CurrencyFormatter";

export default function ProfilePage() {
  // Example user state, replace with your actual selector
  const { is_authenticated, user } = useAppSelector((state) => state.user);
  const { openModal } = useModal();
  return (
    <ScrollView style={{ backgroundColor: "rgb(6,0,25)" }}>
      <SafeAreaView style={{ backgroundColor: "rgb(6,0,25)" }}></SafeAreaView>
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          width: "100%",
          gap: 24,
          padding: 16,
        }}
      >
        {/* Avatar and User Info */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "flex-start",
            display: "flex",
            flexDirection: "row",
            gap: 12,
            width: "100%",
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="person" size={52} color="rgb(6,0,25)" />
          </View>
          <TouchableOpacity
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 8,
            }}
            onPress={() => {
              if (!is_authenticated) {
                console.log("open modal");
                openModal({
                  modal_name: MODAL_COMPONENTS.LOGIN_MODAL,
                });
                return;
              }
              console.log("Navigate to profile details");
              router.push("/profile-details");
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              {is_authenticated ? user?.username : "Login to view"}
            </Text>
            <Fontisto name="angle-right" size={16} color="#989998" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            alignItems: "flex-start",
            justifyContent: "center",
            display: "flex",
            width: "100%",
          }}
        >
          {/* Balance */}
          <Text style={{ color: "#b0b8c1", fontSize: 14, marginTop: 8 }}>
            Total Balance
          </Text>
          <CurrencyFormatter
            amount={is_authenticated ? (user?.availableBalance ?? 0) : 0}
            textStyle={{
              color: "#fff",
              fontSize: 28,
            }}
            decimalStyle={{
              color: "#ddd",
              fontSize: 20,
            }}
            allowToggle={false}
          />
        </View>

        {/* Deposit & Withdraw Buttons */}
        <View
          style={{
            flexDirection: "row",
            gap: 14,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: "#e53935",
              paddingVertical: 12,
              paddingHorizontal: 32,
              // borderRadius: 4,
              flexDirection: "row",
              alignItems: "center",
              width: "50%",
              justifyContent: "center",
            }}
            disabled={!is_authenticated}
            onPress={() => {
              router.push("/deposit");
            }}
          >
            <MaterialIcons
              name="account-balance-wallet"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#fff", fontSize: 16 }}>Deposit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              borderColor: "#fff",
              borderWidth: 1,
              paddingVertical: 12,
              paddingHorizontal: 32,
              // borderRadius: 4,
              width: "50%",
              flexDirection: "row",
              justifyContent: "center",
            }}
            disabled={!is_authenticated}
            onPress={() => {
              router.push("/withdrawal");
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>Withdraw</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            paddingVertical: 14,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              router.push("/(tabs)/open-bets");
            }}
            style={{ flex: 1, alignItems: "center" }}
          >
            <Ionicons
              name="document-text-outline"
              size={28}
              color={is_authenticated ? "#DADBDA" : "#6b7280"}
            />
            <Text
              style={{
                color: is_authenticated ? "#DADBDA" : "#6b7280",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              Bet History
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              router.push("/transactions");
            }}
            style={{ flex: 1, alignItems: "center" }}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={28}
              color={is_authenticated ? "#DADBDA" : "#6b7280"}
            />
            <Text
              style={{
                color: is_authenticated ? "#fff" : "#6b7280",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              Transactions
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Ionicons
              name="gift-outline"
              size={28}
              color={is_authenticated ? "#DADBDA" : "#6b7280"}
            />
            <Text
              style={{
                color: is_authenticated ? "#fff" : "#6b7280",
                fontSize: 14,
                marginTop: 4,
              }}
            >
              Bonus
            </Text>
          </View>
        </View>

        {/* Pending Withdrawals */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: "#1a2a44",
          }}
          disabled={!is_authenticated}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={is_authenticated ? "#fff" : "#6b7280"}
            style={{ marginRight: 12 }}
          />
          <Text
            style={{
              color: is_authenticated ? "#DADBDA" : "#6b7280",
              fontSize: 18,
              flex: 1,
            }}
          >
            Pending Withdrawals
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={is_authenticated ? "#fff" : "#6b7280"}
          />
        </TouchableOpacity>
      </View>
      {/* Footer */}
      <Footer />
    </ScrollView>
  );
}
