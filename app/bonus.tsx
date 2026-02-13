import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState } from "react";
import { useGetBonusListQuery } from "@/store/services/user.service";
import dayjs from "dayjs";
import { useAppSelector } from "@/hooks/useAppDispatch";

const Bonus = () => {
  const { data: bonusData, isLoading } = useGetBonusListQuery();
  const [viewIsHistory, setViewIsHistory] = useState(false);

  // Get global variables for currency
  const { global_variables } = useAppSelector((state) => state.app);
  const currencyCode = global_variables?.currency_code || "";

  // Get user's sport bonus balance
  const { user } = useAppSelector((state) => state.user);
  const sportBonusBalance = user?.availableBalance || 0;

  // Process bonus data
  const { activeBonus, bonusHistory, pendingBalance } = useMemo(() => {
    if (!bonusData || !bonusData.bonus) {
      return { activeBonus: null, bonusHistory: [], pendingBalance: 0 };
    }

    const active = bonusData.bonus.find((item: any) => item.status === 1);
    const history = bonusData.bonus || [];
    const pending = active?.pendingAmount || 0;

    return {
      activeBonus: active,
      bonusHistory: history,
      pendingBalance: pending,
    };
  }, [bonusData]);

  const formatNumber = (num: number) => {
    return num.toFixed(2);
  };

  const formatDate = (date: string) => {
    return dayjs(date).format("DD/MM/YYYY");
  };

  const toggleHistory = () => {
    setViewIsHistory(!viewIsHistory);
  };

  const renderTransactionTable = (transactions: any[]) => {
    if (!transactions || transactions.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No transactions</Text>
        </View>
      );
    }

    return (
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.tableCellHeader]}>Date</Text>
          <Text style={[styles.tableCell, styles.tableCellHeader]}>Stake</Text>
          <Text style={[styles.tableCell, styles.tableCellHeader]}>
            Remaining
          </Text>
        </View>
        {transactions.map((transaction, index) => (
          <View
            key={index}
            style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}
          >
            <Text style={styles.tableCell}>
              {formatDate(transaction.createdAt)}
            </Text>
            <Text style={styles.tableCell}>
              {currencyCode}
              {formatNumber(transaction.amount)}
            </Text>
            <Text style={styles.tableCell}>
              {currencyCode}
              {formatNumber(transaction.balance)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderActiveView = () => {
    return (
      <View style={styles.bonusBody}>
        <View style={styles.bonusHeader}>
          <Text style={styles.headerTitle}>Active Bonus</Text>
          <TouchableOpacity onPress={toggleHistory} style={styles.button}>
            <Text style={styles.buttonText}>See History</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#262262" />
          </View>
        ) : activeBonus ? (
          <>
            <View style={styles.balanceContainer}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Available Bonus Fund:</Text>
                <Text style={styles.balanceValue}>
                  {currencyCode}
                  {formatNumber(sportBonusBalance)}
                </Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Pending Bonus Fund:</Text>
                <Text style={styles.balanceValue}>
                  {currencyCode}
                  {formatNumber(pendingBalance)}
                </Text>
              </View>
            </View>

            {/* Bonus Progress Bar */}
            {activeBonus.target && (
              <View style={styles.bonusBarContainer}>
                <View style={styles.bonusBar}>
                  <View
                    style={[
                      styles.bonusBarFill,
                      {
                        width: `${Math.min(
                          (activeBonus.wagered / activeBonus.target) * 100,
                          100,
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.bonusBarText}>
                  {currencyCode}
                  {formatNumber(activeBonus.wagered)} / {currencyCode}
                  {formatNumber(activeBonus.target)}
                </Text>
              </View>
            )}

            {renderTransactionTable(activeBonus.transactions)}
          </>
        ) : (
          <View style={styles.noBonus}>
            <Text style={styles.noBonusText}>No available bonus</Text>
          </View>
        )}
      </View>
    );
  };

  const renderHistoryView = () => {
    return (
      <View style={styles.bonusBody}>
        <View style={styles.bonusHeader}>
          <Text style={styles.headerTitle}>Bonus History</Text>
          <TouchableOpacity onPress={toggleHistory} style={styles.button}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#262262" />
          </View>
        ) : bonusHistory.length > 0 ? (
          bonusHistory.map((bonus: any, index: number) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>
                  {bonus.name || `Bonus ${index + 1}`}
                </Text>
                <Text
                  style={[
                    styles.historyStatus,
                    bonus.status === 1 && styles.historyStatusActive,
                  ]}
                >
                  {bonus.status === 1 ? "Active" : "Completed"}
                </Text>
              </View>
              {renderTransactionTable(bonus.transactions)}
            </View>
          ))
        ) : (
          <View style={styles.noBonus}>
            <Text style={styles.noBonusText}>No bonus history</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {viewIsHistory ? renderHistoryView() : renderActiveView()}
      </View>
    </ScrollView>
  );
};

export default Bonus;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  content: {
    padding: 15,
  },
  bonusBody: {
    flex: 1,
  },
  bonusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1b1e25",
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 3,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#262262",
  },
  buttonText: {
    color: "#262262",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  balanceContainer: {
    paddingVertical: 10,
    marginBottom: 15,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1b1e25",
  },
  bonusBarContainer: {
    marginBottom: 20,
  },
  bonusBar: {
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 5,
  },
  bonusBarFill: {
    height: "100%",
    backgroundColor: "#262262",
  },
  bonusBarText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  tableRowEven: {
    backgroundColor: "#f5f5f5",
  },
  tableHeader: {
    backgroundColor: "#dddddd",
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: "#1b1e25",
  },
  tableCellHeader: {
    fontWeight: "600",
    fontSize: 13,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  noBonus: {
    marginTop: 40,
    alignItems: "center",
  },
  noBonusText: {
    fontSize: 16,
    color: "#999",
  },
  historyItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#cacaca",
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1b1e25",
  },
  historyStatus: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  historyStatusActive: {
    color: "#4caf50",
  },
});
