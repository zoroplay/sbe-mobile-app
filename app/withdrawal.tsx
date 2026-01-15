import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useState } from "react";
import Input from "@/components/inputs/Input";
import { useAppSelector } from "@/hooks/useAppDispatch";
import useWithdrawal from "@/hooks/useWithdrawal";
import CurrencyFormatter from "@/components/inputs/CurrencyFormatter";
import { Bank } from "@/store/services/types/responses";

const TABS = ["Bank Transfer", "Shop"];

const wihdrawal = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState("");
  const [bankSearch, setBankSearch] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  // Use withdrawal hook
  const { user } = useAppSelector((state) => state.user);
  const { global_variables } = useAppSelector((state) => state.app);

  const {
    banks,
    banksLoading,
    verificationData,
    verifyLoading,
    withdrawalLoading,
    verifyBankAccount,
    submitBankWithdrawal,
  } = useWithdrawal();

  // Filter banks by search
  const filteredBanks = banks?.filter((bank) =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Handle bank selection
  const handleBankSelect = (bank: Bank) => {
    setSelectedBank(bank);
    setBankModalVisible(false);
    setVerified(false);
    setAccountName("");
    setAccountNumber("");
    setError("");
  };

  // Handle account number change and verification
  const handleAccountNumberChange = async (val: string) => {
    setAccountNumber(val);
    setVerified(false);
    setError("");
    setAccountName("");
    if (val.length === 10 && selectedBank) {
      try {
        const result = await verifyBankAccount(val, selectedBank.code);
        setAccountName(result.message || "");
        setVerified(true);
      } catch (err: any) {
        setAccountName("");
        setVerified(false);
        setError(
          err?.data?.message || err?.message || "Failed to verify account"
        );
      }
    }
  };

  // Handle withdrawal submit
  const handleSubmit = async () => {
    setError("");
    if (!amount || Number(amount) < 100) {
      setError("Minimum withdrawal amount is ₦100");
      return;
    }
    if (!selectedBank) {
      setError("Please select a bank");
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      setError("Please enter a valid 10-digit account number");
      return;
    }
    if (!verified || !accountName) {
      setError("Please verify your account number first");
      return;
    }
    try {
      await submitBankWithdrawal({
        amount: Number(amount),
        bankCode: selectedBank.code,
        accountNumber,
        accountName,
        type: "online",
        source: "retail",
      });
      setAmount("");
      setAccountNumber("");
      setAccountName("");
      setSelectedBank(null);
      setVerified(false);
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || "Error occurred during withdrawal"
      );
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "rgb(6,0,25)" }}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === idx && styles.tabButtonSelected,
            ]}
            onPress={() => setSelectedTab(idx)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === idx && styles.tabTextSelected,
              ]}
            >
              {tab}
            </Text>
            {selectedTab === idx && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {selectedTab === 0 ? (
          <>
            {/* Bank selection */}
            <TouchableOpacity
              style={styles.selectBank}
              onPress={() => setBankModalVisible(true)}
            >
              <Text style={styles.selectBankText}>
                {selectedBank ? selectedBank.name : "Select a Bank"}
              </Text>
            </TouchableOpacity>
            {/* Account number */}
            <Input
              label="Account Number"
              value={accountNumber}
              onChangeText={handleAccountNumberChange}
              type="num_select"
              placeholder="Account Number"
              keyboardType="numeric"
              wrapperStyle={styles.inputWrapper}
              inputStyle={styles.input}
              isChecking={verifyLoading}
              isValid={verified}
            />
            {/* Account name display */}
            {accountName ? (
              <Text
                style={[styles.accountName, verified && { color: "#10b981" }]}
              >
                Account Name: {accountName}
              </Text>
            ) : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {/* Balance info */}
            <View
              style={{
                width: "100%",
                flexDirection: "column",
                // gap: 12,
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                }}
              >
                <Text style={styles.balanceLabel}>Balance </Text>
                <CurrencyFormatter
                  amount={user?.availableBalance ?? 0}
                  textStyle={{
                    color: "#ffffff",
                    fontSize: 14,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 2,
                }}
              >
                <Text style={styles.withdrawableLabel}>
                  Withdrawable Balance
                </Text>
                <CurrencyFormatter
                  amount={user?.availableBalance ?? 0}
                  textStyle={{
                    color: "#ffffff",
                    fontSize: 14,
                  }}
                />
              </View>
            </View>
            {/* Amount input */}
            <Input
              label="Amount (₦)"
              value={amount}
              onChangeText={setAmount}
              type="num_select"
              placeholder="min. 1"
              keyboardType="numeric"
              wrapperStyle={styles.inputWrapper}
              inputStyle={styles.input}
            />
            {/* Continue button */}
            <TouchableOpacity
              style={styles.continueButton}
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={withdrawalLoading}
            >
              <Text style={styles.continueButtonText}>
                {withdrawalLoading ? "Processing..." : "Continue"}
              </Text>
            </TouchableOpacity>
            {/* Bank modal */}
            <Modal
              visible={bankModalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setBankModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select a Bank</Text>
                  <Input
                    value={bankSearch}
                    onChangeText={setBankSearch}
                    placeholder="Type to search..."
                    wrapperStyle={{
                      marginBottom: 12,
                      backgroundColor: "#181a20",
                      borderColor: "#181a20",
                    }}
                    inputStyle={{ color: "#fff" }}
                  />
                  <ScrollView style={{ maxHeight: 250 }}>
                    {banksLoading ? (
                      <Text
                        style={{
                          color: "#fff",
                          textAlign: "center",
                          marginTop: 20,
                        }}
                      >
                        Loading banks...
                      </Text>
                    ) : filteredBanks?.length ? (
                      filteredBanks.map((bank) => (
                        <TouchableOpacity
                          key={bank.code}
                          style={{
                            paddingVertical: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: "#232733",
                          }}
                          onPress={() => handleBankSelect(bank)}
                        >
                          <Text style={{ color: "#fff", fontSize: 16 }}>
                            {bank.name}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <Text
                        style={{
                          color: "#fff",
                          textAlign: "center",
                          marginTop: 20,
                        }}
                      >
                        No banks found
                      </Text>
                    )}
                  </ScrollView>
                  <TouchableOpacity
                    onPress={() => setBankModalVisible(false)}
                    style={styles.closeModalBtn}
                  >
                    <Text style={{ color: "#fff" }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          <>
            <Text style={styles.balanceLabel}>
              Balance(SSP){" "}
              {/* <Text style={styles.balanceValue}>{balance.toFixed(2)}</Text> */}
            </Text>
            <Text style={styles.withdrawableLabel}>
              Withdrawable Balance ₦{" "}
              <Text style={styles.balanceValue}>
                {/* {withdrawableBalance.toFixed(2)} */}
              </Text>
            </Text>
            <Input
              label="Amount (SSP)"
              value={amount}
              onChangeText={setAmount}
              type="num_select"
              placeholder="0"
              keyboardType="numeric"
              wrapperStyle={styles.inputWrapper}
              inputStyle={styles.input}
            />
            <TouchableOpacity style={styles.continueButton} activeOpacity={0.8}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default wihdrawal;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#232733",
    borderBottomWidth: 1,
    borderBottomColor: "#C72C3B",
    height: 48,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "#232733",
    position: "relative",
  },
  tabButtonSelected: {
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
  },
  selectBank: {
    height: 44,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    padding: 16,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectBankText: {
    color: "#2a2a2a",
    fontSize: 16,
    fontWeight: "600",
  },
  inputWrapper: {
    marginBottom: 16,
    backgroundColor: "#232733",
    borderColor: "#232733",
  },
  input: {
    color: "#2a2a2a",
    fontWeight: "600",
    fontSize: 15,
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 13,
    // marginBottom: 4,
  },
  withdrawableLabel: {
    color: "#fff",
    fontSize: 13,
    // marginBottom: 12,
  },
  balanceValue: {
    color: "#fff",
    fontWeight: "bold",
  },
  continueButton: {
    backgroundColor: "#C72C3B",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#232733",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  closeModalBtn: {
    marginTop: 24,
    alignSelf: "center",
    backgroundColor: "#C72C3B",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  accountName: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff6347",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
});
