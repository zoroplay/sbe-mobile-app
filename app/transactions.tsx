import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import DateRangeInput from "@/components/inputs/DateRangeInput";
import { useFetchTransactionsQuery } from "@/store/services/bets.service";
import environmentConfig from "@/store/services/configs/environment.config";
import { AppHelper } from "@/utils/helper";

const getDefaultDateRange = () => {
  const today = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);
  return {
    startDate: twoDaysAgo.toISOString().slice(0, 10),
    endDate: today.toISOString().slice(0, 10),
  };
};

const Transactions = () => {
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [pageSize, setPageSize] = useState("15");
  const [currentPage, setCurrentPage] = useState(1);
  console.log("Date Range:", {
    clientId: String(environmentConfig.CLIENT_ID!),
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    page: currentPage,
  });
  const { data, isLoading } = useFetchTransactionsQuery({
    clientId: String(environmentConfig.CLIENT_ID!),
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    page: currentPage,
  });
  const transactions = Array.isArray(data?.data) ? data?.data : [];

  // useEffect(() => {
  //   fetchTransactions({
  //     clientId: String(environmentConfig.CLIENT_ID!),
  //     startDate: dateRange.startDate,
  //     endDate: dateRange.endDate,
  //     page: currentPage,
  //   });
  // }, [dateRange, currentPage, pageSize]);

  return (
    <View style={{ flex: 1, backgroundColor: "#151c2b", padding: 12 }}>
      <DateRangeInput
        value={dateRange}
        onChange={setDateRange}
        placeholder="Select Date"
      />
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#e53935"
          style={{ marginTop: 32 }}
        />
      ) : (
        <ScrollView style={{ marginTop: 16 }}>
          {transactions.length ? (
            transactions.map((tx, idx) => (
              <View key={tx.id || idx} style={styles.txItem}>
                <Text style={styles.txType}>{tx.type}</Text>
                <Text style={styles.txDate}>
                  {AppHelper.formatDate(tx?.transactionDate)}
                </Text>
                <Text
                  style={[
                    styles.txAmount,
                    tx?.type === "debit" && { color: "#e53935" },
                  ]}
                >
                  + {tx.amount}
                </Text>
                <Text
                  style={[
                    styles.txStatus,
                    tx?.type === "debit" && { color: "#e53935" },
                  ]}
                >
                  {tx.status}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.noTxBox}>
              <Text style={styles.noTxText}>
                NOTE: Click on a transaction to view more details
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default Transactions;

const styles = StyleSheet.create({
  txItem: {
    backgroundColor: "#232733",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  txType: {
    color: "#b0b8c1",
    fontSize: 16,
    flex: 2,
  },
  txDate: {
    color: "#b0b8c1",
    fontSize: 13,
    flex: 2,
  },
  txAmount: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  txStatus: {
    color: "#b0b8c1",
    fontSize: 13,
    flex: 1,
    textAlign: "right",
  },
  noTxBox: {
    backgroundColor: "#444",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginTop: 48,
  },
  noTxText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
