import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { BetHistoryBet } from "@/store/services/data/queries.types";

type TicketDetailsProps = {
  bet: BetHistoryBet;
};

const TicketDetails: React.FC<TicketDetailsProps> = ({ bet }) => {
  const betDate = new Date(bet.created);
  const dateStr = betDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
  });
  const timeStr = betDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ticketId}>
            Ticket ID: {bet.betslipId || bet.id}
          </Text>
        </View>
        <Text style={styles.headerDate}>
          {dateStr} {timeStr}
        </Text>
      </View>
      {/* Bet Type and Status */}
      <View style={styles.row}>
        <Text style={styles.betType}>
          {bet.betCategoryDesc || bet.betCategory || "Single"}
        </Text>
        <Text
          style={[
            styles.status,
            bet.statusCode === 1
              ? styles.statusWon
              : bet.statusCode === 2
                ? styles.statusLost
                : styles.statusPending,
          ]}
        >
          {bet.statusCode === 1
            ? "Won"
            : bet.statusCode === 2
              ? "Lost"
              : "Pending"}
        </Text>
      </View>
      {/* Total Return */}
      <View style={styles.row}>
        <Text style={styles.label}>Total Return</Text>
        <Text style={styles.returnValue}>
          {bet.winnings?.toFixed(2) || bet.possibleWin?.toFixed(2) || "0.00"}
        </Text>
      </View>
      {/* Total Stake and Odds */}
      <View style={styles.row}>
        <Text style={styles.label}>Total Stake</Text>
        <Text style={styles.value}>{bet.stake?.toFixed(2)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Total Odds</Text>
        <Text style={styles.value}>{bet.totalOdd?.toFixed(2) || "-"}</Text>
      </View>
      {/* Game Info - show all selections */}
      {bet.selections.map((selection, idx) => (
        <View style={styles.gameInfo} key={selection.eventId || idx}>
          <Text style={styles.gameId}>
            Game ID: {selection.eventId} |{" "}
            {selection.eventDate
              ? new Date(selection.eventDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                })
              : "--/--"}{" "}
            {selection.eventTime || ""}
          </Text>
          <Text style={styles.eventName}>{selection.eventName}</Text>
          <Text style={styles.ftScore}>FT Score: -- : --</Text>
          {/* <View style={styles.pickBox}>
            <Text style={styles.pickLabel}>Pick:</Text>
            <Text style={styles.pickValue}>{selection.selectionName} @ {selection.odd}</Text>
          </View> */}
          <View style={styles.pickBox}>
            <Text style={styles.pickLabel}>Market:</Text>
            <Text style={styles.pickValue}>{selection.marketName}</Text>
          </View>
        </View>
      ))}
      {/* Bets/Details Row */}
      <View style={styles.row}>
        <Text style={styles.label}>
          Number of Bets: {bet.selections.length}
        </Text>
        <Text style={styles.link}>Bet Details</Text>
      </View>
      {/* Transaction History Link */}
      <View style={styles.row}>
        <Text style={styles.link}>Check Transaction History</Text>
      </View>
    </View>
  );
};

export default TicketDetails;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ticketId: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 15,
  },
  headerDate: {
    color: "#444",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  betType: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 16,
  },
  status: {
    fontWeight: "bold",
    fontSize: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusWon: {
    color: "#10B981",
  },
  statusLost: {
    color: "#C72C3B",
  },
  statusPending: {
    color: "#9CA3AF",
  },
  label: {
    color: "#888",
    fontSize: 14,
  },
  returnValue: {
    color: "#10B981",
    fontWeight: "bold",
    fontSize: 18,
  },
  value: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 16,
  },
  gameInfo: {
    backgroundColor: "#f7f7f7",
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
  gameId: {
    color: "#888",
    fontSize: 12,
    marginBottom: 2,
  },
  eventName: {
    color: "#232b3b",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  ftScore: {
    color: "#888",
    fontSize: 13,
    marginBottom: 4,
  },
  pickBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  pickLabel: {
    color: "#888",
    fontSize: 13,
    marginRight: 4,
  },
  pickValue: {
    color: "#232b3b",
    fontSize: 14,
  },
  link: {
    color: "#2C7BE5",
    fontSize: 14,
    fontWeight: "500",
  },
});
