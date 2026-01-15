import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { BetHistoryBet } from "@/store/services/data/queries.types";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { Ionicons } from "@expo/vector-icons";

const TicketDetails: React.FC = () => {
  const { bet_data } = useAppSelector((state) => state.betting);
  const bet = bet_data as BetHistoryBet;
  
  const betDate = new Date(bet?.created);
  const dateStr = betDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
  });
  const timeStr = betDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Determine status
  const isWon = bet.statusCode === 1;
  const isLost = bet.statusCode === 2;
  const isPending = bet.statusCode === 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Text style={styles.ticketId}>Ticket ID: {bet.betslipId || bet.id}</Text>
          <Text style={styles.headerDate}>
            {dateStr} {timeStr}
          </Text>
        </View>

        {/* Bet Type and Status */}
        <View style={styles.betTypeRow}>
          <Text style={styles.betType}>
            {bet.betCategoryDesc || bet.betCategory || "Single"}
          </Text>
          <Text
            style={[
              styles.status,
              isWon && styles.statusWon,
              isLost && styles.statusLost,
              isPending && styles.statusPending,
            ]}
          >
            {isWon ? "Won" : isLost ? "Lost" : "Pending"}
          </Text>
        </View>

        {/* Total Return */}
        <View style={styles.returnRow}>
          <Text style={styles.returnLabel}>Total Return</Text>
          <Text style={styles.returnValue}>
            {isWon
              ? (bet.winnings?.toFixed(2) || bet.possibleWin?.toFixed(2) || "0.00")
              : isPending
              ? (bet.possibleWin?.toFixed(2) || "0.00")
              : "0.00"}
          </Text>
        </View>

        {/* Stake and Odds */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Stake</Text>
          <Text style={styles.infoValue}>{bet.stake?.toFixed(2)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Odds</Text>
          <Text style={styles.infoValue}>{bet.totalOdd?.toFixed(2) || "-"}</Text>
        </View>
      </View>

      {/* Congratulations Banner - Only show if won */}
      {isWon && (
        <View style={styles.congratsBanner}>
          <View style={styles.congratsContent}>
            <Ionicons name="trophy" size={32} color="#fff" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.congratsText}>congratulations</Text>
              <Text style={styles.congratsSubText}>YOU GOT THIS!!!</Text>
            </View>
            {/* <View style={styles.souboooTag}>
              <Text style={styles.souboooText}>SOUBOOO</Text>
            </View> */}
          </View>
        </View>
      )}

      {/* Game Details */}
      {bet.selections.map((selection, idx) => {
        const eventDate = selection.eventDate
          ? new Date(selection.eventDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
            })
          : "--/--";
        const eventTime = selection.startTime || selection.eventTime || "--:--";

        return (
          <View style={styles.gameCard} key={selection.eventId || idx}>
            <Text style={styles.gameHeader}>
              Game ID: {selection.eventId || "N/A"} | {eventDate} {eventTime}
            </Text>
            <Text style={styles.eventName}>{selection.eventName}</Text>
            <Text style={styles.ftScore}>
              FT Score: {selection.homeScore || "--"} : {selection.awayScore || "--"}
            </Text>
            
            <View style={styles.pickRow}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.pickLabel}>Pick: </Text>
              <Text style={styles.pickValue}>
                {selection.outcomeName || selection.selectionName} @{selection.odds || selection.odd}
              </Text>
            </View>
            
            <View style={styles.marketRow}>
              <Text style={styles.marketLabel}>Market: </Text>
              <Text style={styles.marketValue}>{selection.marketName}</Text>
            </View>
          </View>
        );
      })}

      {/* Footer Section */}
      <View style={styles.footerSection}>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            Number of Bets: {bet.selections.length}
          </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Bet Details</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.transactionLink}>
          <Text style={styles.linkText}>Check Transaction History</Text>
          <Ionicons name="chevron-forward" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TicketDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1626",
  },
  headerSection: {
    backgroundColor: "#1a2332",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3547",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  ticketId: {
    color: "#9ca3af",
    fontSize: 13,
  },
  headerDate: {
    color: "#9ca3af",
    fontSize: 13,
  },
  betTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  betType: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  status: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusWon: {
    color: "#10B981",
  },
  statusLost: {
    color: "#ef4444",
  },
  statusPending: {
    color: "#9ca3af",
  },
  returnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  returnLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  returnValue: {
    color: "#10B981",
    fontSize: 32,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  infoLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  infoValue: {
    color: "#9ca3af",
    fontSize: 14,
  },
  congratsBanner: {
    backgroundColor: "#4c5fd5",
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  congratsContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  congratsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "300",
  },
  congratsSubText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 2,
  },
  souboooTag: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  souboooText: {
    color: "#4c5fd5",
    fontSize: 13,
    fontWeight: "bold",
  },
  gameCard: {
    backgroundColor: "#1a2332",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  gameHeader: {
    color: "#9ca3af",
    fontSize: 13,
    marginBottom: 8,
  },
  eventName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  ftScore: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 12,
  },
  pickRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  pickLabel: {
    color: "#9ca3af",
    fontSize: 14,
    marginLeft: 6,
  },
  pickValue: {
    color: "#fff",
    fontSize: 14,
  },
  marketRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  marketLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  marketValue: {
    color: "#fff",
    fontSize: 14,
  },
  footerSection: {
    backgroundColor: "#1a2332",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3547",
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
  linkText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "500",
  },
  transactionLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
