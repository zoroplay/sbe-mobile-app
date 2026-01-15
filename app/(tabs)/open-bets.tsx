import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { useLazyFetchBetHistoryQuery } from "@/store/services/bets.service";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OVERVIEW } from "@/data/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";
import environmentConfig from "@/store/services/configs/environment.config";
import { BetHistoryBet } from "@/store/services/data/queries.types";
import { setBetData } from "@/store/features/slice/betting.slice";

export default function OpenBetsPage() {
  const [fetchBetHistory, { data, isFetching: isLoading }] =
    useLazyFetchBetHistoryQuery();

  const { user } = useAppSelector((state) => state.user);
  const [expandedBetId, setExpandedBetId] = useState<number | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const renderOpenBetCard = (bet: BetHistoryBet) => {
    const selection = bet.selections[0];
    const isExpanded = expandedBetId === bet.id;
    const isLive = bet.statusCode === 0; // Assuming 0 means live/pending

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpandedBetId(isExpanded ? null : bet.id)}
        style={{
          backgroundColor: "#1a2332",
          borderRadius: 8,
          marginBottom: 12,
          overflow: "hidden",
          width: "100%",
          // maxWidth: 400,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#2a3547",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>
              {bet.betCategoryDesc || bet.betCategory || "Single"}
            </Text>
            {isLive && (
              <View
                style={{
                  backgroundColor: "#ef4444",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>
                  Live
                </Text>
              </View>
            )}
          </View>
          <Text style={{ color: "#9ca3af", fontSize: 20 }}>
            {isExpanded ? "−" : "+"}
          </Text>
        </View>

        {/* Collapsed View - Event Name */}
        {!isExpanded && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: "#e5e7eb", fontSize: 15 }} numberOfLines={1}>
              {selection.eventName}
            </Text>
          </View>
        )}

        {/* Expanded View - Full Details */}
        {isExpanded && (
          <>
            {/* All Selections */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
              {bet.selections.map((sel, idx) => (
                <View
                  key={idx}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: idx < bet.selections.length - 1 ? 1 : 0,
                    borderBottomColor: "#2a3547",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color="#9ca3af"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: "#e5e7eb", fontSize: 15, flex: 1 }}>
                      {sel.outcomeName}{" "}
                      <Text style={{ color: "#10b981", fontWeight: "bold" }}>
                        @ {Number(sel.odds??0).toFixed(2) || "N/A"}
                      </Text>{" "}
                      <Text style={{ color: "#9ca3af" }}>
                        {sel.marketName || ""}
                      </Text>
                    </Text>
                  </View>

                  {/* Event Name - Underlined */}
                  <Text
                    style={{
                      color: "#d1d5db",
                      fontSize: 14,
                      textDecorationLine: "underline",
                      marginBottom: 4,
                    }}
                  >
                    {sel.eventName}
                  </Text>

                  {/* Date/Time */}
                  <Text style={{ color: "#9ca3af", fontSize: 13 }}>
                    { sel.eventDate || ""}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Stake and Pot. Win */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "#2a3547",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#9ca3af", fontSize: 13, marginBottom: 4 }}>
              Stake
            </Text>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {bet.stake}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ color: "#9ca3af", fontSize: 13, marginBottom: 4 }}>
              Pot. Win
            </Text>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {bet.possibleWin}
            </Text>
          </View>
        </View>

        {/* Cashout Button */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          {bet.cashOutAmount > 0 ? (
            <TouchableOpacity
              style={{
                backgroundColor: "#10b981",
                borderRadius: 6,
                paddingVertical: 12,
                alignItems: "center",
              }}
              onPress={(e) => {
                e.stopPropagation();
                // Handle cashout
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
                Cashout {bet.cashOutAmount.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ) : (
            <View
              style={{
                backgroundColor: "#374151",
                borderRadius: 6,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#9ca3af", fontWeight: "600", fontSize: 15 }}>
                Cashout Unavailable
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  const renderBetHistoryCard = (bet: BetHistoryBet, onPress?: () => void) => {
    const selection = bet.selections[0];

    // Status: 1 = Won, 2 = Lost, 0 = Pending
    let statusLabel = "Pending";
    let statusColor = "#fff";
    let statusBg = "#9CA3AF"; // gray

    if (bet.statusCode === 1) {
      statusLabel = "Won";
      statusColor = "#fff";
      statusBg = "#10B981"; // green
    } else if (bet.statusCode === 2) {
      statusLabel = "Lost";
      statusColor = "#fff";
      statusBg = "#9CA3AF"; // gray
    }

    // Format the date (native JS)
    const betDate = new Date(bet.created);
    const day = betDate.getDate().toString();
    const month = betDate.toLocaleString("default", { month: "short" });

    // Calculate actual return (0 if lost, winnings if won)
    const actualReturn =
      bet.statusCode === 1 ? bet.winnings || bet.possibleWin || 0 : 0;

    const CardContent = (
      <View style={styles.container}>
        {/* Date Section - Left Side */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateDay}>{day}</Text>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>

        {/* Card Content */}
        <View style={styles.card}>
          {/* Header with Bet Type and Status */}
          <Pressable onPress={() => {
            dispatch(setBetData(bet));
            router.push(`/ticket-details`);

          }} style={[styles.header, { backgroundColor: statusBg }]}>
            <Text style={[styles.headerText, { color: statusColor }]}>
              {bet.betCategoryDesc || bet.betCategory || "Single"}
            </Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
              <Text style={[styles.chevron, { color: statusColor }]}>›</Text>
            </View>
          </Pressable>

          {/* Stake and Return Labels */}
          <View style={styles.labelsRow}>
            <Text style={styles.label}>Total Stake(NGN)</Text>
            <Text style={styles.label}>Total Return</Text>
          </View>

          {/* Stake and Return Values */}
          <View style={styles.valuesRow}>
            <Text style={styles.value}>{bet.stake?.toFixed(2)}</Text>
            <Text style={styles.value}>{actualReturn.toFixed(2)}</Text>
          </View>

          {/* Event Name */}
          <Text style={styles.eventName} numberOfLines={2}>
            {selection.eventName}
          </Text>
        </View>
      </View>
    );

    // If onPress provided, wrap in TouchableOpacity
    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {CardContent}
        </TouchableOpacity>
      );
    }

    return CardContent;
  };
  const { is_authenticated } = useAppSelector((state) => state.user);
  const tabList = [
    { id: 0, name: "Open Bets", key: "open" },
    { id: 1, name: "Bet History", key: "history" },
  ];
  const [selectedTab, setSelectedTab] = useState(0);
  const subTabs = [
    { id: 0, name: "All" },
    { id: 1, name: "Settled" },
    { id: 2, name: "Unsettled" },
  ];
  const [selectedSubTab, setSelectedSubTab] = useState(0);
  const { openModal } = useModal();
  useEffect(() => {
    let status: string | number = "";
    selectedTab === 0 && (status = 0);
    if (selectedTab === 1) {
      // Bet History tab

      if (selectedSubTab === 1)
        status = "settled"; // Settled
      else if (selectedSubTab === 2) status = "0";
      else status = ""; // Unsettled
      // All: status remains ""
    }
    fetchBetHistory({
      page: 1,
      clientId: environmentConfig.CLIENT_ID!,
      userId: Number(user?.id),
      status: status,
    });
  }, [selectedTab, selectedSubTab, user]);

  if (!is_authenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#011024" }}>
        <View style={styles.centeredContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={48}
              color="#bfc9d1"
            />
          </View>
          <Text style={styles.infoText}>
            Please Log In to see your Open Bets and{"\n"}Cashout Bets
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => {
              openModal({
                modal_name: MODAL_COMPONENTS.LOGIN_MODAL,
              });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const renderTab = () => {
    switch (selectedTab) {
      case 0:
        // Open Bets Tab
        return (
          <ScrollView style={{ flex: 1, backgroundColor: "rgb(6,0,25)" }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "#011024",
                justifyContent: "center",
                alignItems: "center",
                padding: 8,
                width: "100%",
              }}
            >
              {isLoading ? (
                <Text style={{ color: "#6b7280", fontSize: 16 }}>
                  Loading...
                </Text>
              ) : Array.isArray(data?.bets) && data?.bets.length > 0 ? (
                data.bets.map((bet) => (
                  <View key={bet.id} style={{ width: "100%" }}>{renderOpenBetCard(bet)}</View>
                ))
              ) : (
                <Text style={{ color: "#6b7280", fontSize: 16 }}>
                  No Open Bets Available.
                </Text>
              )}
            </View>
          </ScrollView>
        );
      case 1:
        switch (selectedSubTab) {
          case 1:
          // Settled Bets
          case 2:
          // Unsettled Bets
          default:
            return (
              <ScrollView style={{ flex: 1, backgroundColor: "rgb(6,0,25)" }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#011024",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                  }}
                >
                  {isLoading ? (
                    <Text style={{ color: "#6b7280", fontSize: 16 }}>
                      Loading...
                    </Text>
                  ) : Array.isArray(data?.bets) && data?.bets.length > 0 ? (
                    data.bets.map((bet) => (
                      <View key={bet.id}>{renderBetHistoryCard(bet)}</View>
                    ))
                  ) : (
                    <Text style={{ color: "#6b7280", fontSize: 16 }}>
                      No Open Bets Available.
                    </Text>
                  )}
                </View>
              </ScrollView>
            );

            break;
        }

      default:
        break;
    }
  };
  // Authenticated: show tab navigation
  return (
    <View style={{ flex: 1, backgroundColor: "rgb(6,0,25)" }}>
      {/* Tab Bar */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "rgb(6,0,25)",
          height: 48,
        }}
      >
        {tabList.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => setSelectedTab(item.id)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              backgroundColor: "rgb(6,0,25)",
            }}
          >
            <Text
              style={{
                color: selectedTab === item.id ? "#fff" : "#e0e0e0",
                fontWeight: selectedTab === item.id ? "bold" : "600",
                fontSize: 16,
              }}
            >
              {item.name}
            </Text>
            {selectedTab === item.id && (
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 3,
                  backgroundColor: "#C72C3B",
                }}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Sub Tabs (All, Settled, Unsettled) - Only show for Bet History */}
      {selectedTab === 1 && (
        <View
          style={{ flexDirection: "row", backgroundColor: "#fff", height: 40 }}
        >
          {subTabs.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => setSelectedSubTab(item.id)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                backgroundColor: "#fff",
              }}
            >
              <Text
                style={{
                  color: selectedSubTab === item.id ? "#232b3b" : "#b0b8c1",
                  fontWeight: selectedSubTab === item.id ? "bold" : "600",
                  fontSize: 15,
                }}
              >
                {item.name}
              </Text>
              {selectedSubTab === item.id && (
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 3,
                    backgroundColor: "#C72C3B",
                  }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
      {renderTab()}

      {/* Content */}
      {/* <View
        style={{
          flex: 1,
          backgroundColor: "#011024",
          justifyContent: "center",
          alignItems: "center",
          padding: 8,
        }}
      >
        {isLoading ? (
          <Text style={{ color: "#6b7280", fontSize: 16 }}>Loading...</Text>
        ) : selectedTab === 1 ? (
          Array.isArray(data?.data?.bets) && data.data?.bets.length > 0 ? (
            // Group by date (assume bet.created is a date string)
            (() => {
              const grouped = {};
              data.data.bets.forEach((bet) => {
                const d = new Date(bet.created);
                const day = d.getDate();
                const month = d.toLocaleString("default", { month: "short" });
                const key = `${day} ${month}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(bet);
              });
              return Object.entries(grouped).map(([date, bets]) => (
                <View key={date} style={{ width: "100%", marginBottom: 8 }}>
                  <Text
                    style={{
                      color: "#444",
                      fontWeight: "bold",
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {date}
                  </Text>
                  {bets.map((bet) => (
                    <View key={bet.id}>{renderBetHistoryCard(bet)}</View>
                  ))}
                </View>
              ));
            })()
          ) : (
            <Text style={{ color: "#6b7280", fontSize: 16 }}>
              No Tickets Available.
            </Text>
          )
        ) : (
          <Text style={{ color: "#6b7280", fontSize: 16 }}>
            No Tickets Available.
          </Text>
        )}
      </View> */}
    </View>
  );
}
const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    backgroundColor: "#1a2332",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    color: "#bfc9d1",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    marginTop: 4,
    lineHeight: 24,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "#C72C3B",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#C72C3B",
    fontSize: 16,
    fontWeight: "500",
  },
  container: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
    width: "100%",
  },
  dateContainer: {
    width: 40,
    alignItems: "center",
    paddingTop: 8,
    marginRight: 4,
  },
  dateDay: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#9CA3AF",
    lineHeight: 36,
  },
  dateMonth: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: -4,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    // borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  chevron: {
    fontSize: 20,
    fontWeight: "bold",
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  label: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  valuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  eventName: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
