import { useAppSelector } from "@/hooks/useAppDispatch";
import { useLazyFetchBetHistoryQuery } from "@/store/services/bets.service";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OVERVIEW } from "@/data/routes/routes";
import { Ionicons } from "@expo/vector-icons";
import { useModal } from "@/hooks/useModal";
import { MODAL_COMPONENTS } from "@/store/features/types";
import environmentConfig from "@/store/services/configs/environment.config";
import { BetHistoryBet } from "@/store/services/data/queries.types";

export default function OpenBetsPage() {
  const [fetchBetHistory, { data, isFetching: isLoading }] =
    useLazyFetchBetHistoryQuery();

  const { user } = useAppSelector((state) => state.user);
  const renderOpenBetCard = (bet: BetHistoryBet) => {
    const selection = bet.selections[0];
    return (
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 6,
          borderWidth: 1,
          borderColor: "#eee",
          marginBottom: 16,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          minWidth: 260,
          maxWidth: 340,
          alignSelf: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={{ fontWeight: "bold", color: "#222" }}>
            {bet.betCategoryDesc || bet.betCategory || "Single"}
          </Text>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: "#eee",
              marginLeft: 8,
            }}
          />
        </View>
        <Text style={{ color: "#222", marginBottom: 8 }}>
          {selection.eventName}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text style={{ color: "#444" }}>Stake</Text>
          <Text style={{ color: "#444" }}>Pot. Win</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "bold", color: "#222" }}>{bet.stake}</Text>
          <Text style={{ fontWeight: "bold", color: "#222" }}>
            {bet.possibleWin}
          </Text>
        </View>
        {bet.cashOutAmount > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: "#228B22",
              borderRadius: 4,
              paddingVertical: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Cashout NGN {Number(bet.cashOutAmount).toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  // Helper: Render bet history card
  // const renderBetHistoryCard = (bet: BetHistoryBet) => {
  //   const selection = bet.selections[0];
  //   // Status: 1 = Won, 2 = Lost, 0 = Pending
  //   let statusLabel = "Pending";
  //   let statusColor = "#b0b8c1";
  //   let statusBg = "#eee";
  //   if (bet.statusCode === 1) {
  //     statusLabel = "Won";
  //     statusColor = "#fff";
  //     statusBg = "#10B981";
  //   } else if (bet.statusCode === 2) {
  //     statusLabel = "Lost";
  //     statusColor = "#fff";
  //     statusBg = "#888";
  //   }
  //   return (
  //     <View
  //       style={{
  //         backgroundColor: "#fff",
  //         borderRadius: 6,
  //         borderWidth: 1,
  //         borderColor: "#eee",
  //         marginBottom: 16,
  //         padding: 0,
  //         shadowColor: "#000",
  //         shadowOpacity: 0.05,
  //         shadowRadius: 4,
  //         elevation: 2,
  //         minWidth: 260,
  //         maxWidth: 340,
  //         alignSelf: "center",
  //       }}
  //     >
  //       <View
  //         style={{
  //           flexDirection: "row",
  //           alignItems: "center",
  //           borderTopLeftRadius: 6,
  //           borderTopRightRadius: 6,
  //           overflow: "hidden",
  //         }}
  //       >
  //         <View
  //           style={{
  //             backgroundColor: statusBg,
  //             flex: 1,
  //             padding: 10,
  //             borderTopLeftRadius: 6,
  //             flexDirection: "row",
  //             alignItems: "center",
  //           }}
  //         >
  //           <Text
  //             style={{ fontWeight: "bold", color: statusColor, fontSize: 15 }}
  //           >
  //             {bet.betCategoryDesc || bet.betCategory || "Single"}
  //           </Text>
  //         </View>
  //         <View
  //           style={{
  //             backgroundColor: statusBg,
  //             paddingHorizontal: 12,
  //             paddingVertical: 10,
  //             borderTopRightRadius: 6,
  //           }}
  //         >
  //           <Text
  //             style={{ color: statusColor, fontWeight: "bold", fontSize: 15 }}
  //           >
  //             {statusLabel}
  //           </Text>
  //         </View>
  //       </View>
  //       <View
  //         style={{
  //           flexDirection: "row",
  //           justifyContent: "space-between",
  //           paddingHorizontal: 10,
  //           paddingTop: 8,
  //         }}
  //       >
  //         <Text style={{ color: "#888", fontSize: 12 }}>Total Stake(NGN)</Text>
  //         <Text style={{ color: "#888", fontSize: 12 }}>Total Return</Text>
  //       </View>
  //       <View
  //         style={{
  //           flexDirection: "row",
  //           justifyContent: "space-between",
  //           paddingHorizontal: 10,
  //           paddingBottom: 4,
  //         }}
  //       >
  //         <Text style={{ fontWeight: "bold", color: "#222", fontSize: 15 }}>
  //           {bet.stake?.toFixed(2)}
  //         </Text>
  //         <Text style={{ fontWeight: "bold", color: "#222", fontSize: 15 }}>
  //           {bet.possibleWin?.toFixed(2)}
  //         </Text>
  //       </View>
  //       <Text
  //         style={{ color: "#222", paddingHorizontal: 10, paddingBottom: 10 }}
  //       >
  //         {selection.eventName}
  //       </Text>
  //     </View>
  //   );
  // };

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
          <View style={[styles.header, { backgroundColor: statusBg }]}>
            <Text style={[styles.headerText, { color: statusColor }]}>
              {bet.betCategoryDesc || bet.betCategory || "Single"}
            </Text>
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
              <Text style={[styles.chevron, { color: statusColor }]}>›</Text>
            </View>
          </View>

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
  const router = useRouter();
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
              }}
            >
              {isLoading ? (
                <Text style={{ color: "#6b7280", fontSize: 16 }}>
                  Loading...
                </Text>
              ) : Array.isArray(data?.bets) && data?.bets.length > 0 ? (
                data.bets.map((bet) => (
                  <View key={bet.id}>{renderOpenBetCard(bet)}</View>
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
