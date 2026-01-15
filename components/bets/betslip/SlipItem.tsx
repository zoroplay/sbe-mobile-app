import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Input from "@/components/inputs/Input";
import { useAppSelector } from "@/hooks/useAppDispatch";
import CurrencyFormatter from "@/components/inputs/CurrencyFormatter";
import { SelectedBet } from "@/store/features/types";
import { useBetting } from "@/hooks/useBetting";
import { Text } from "@/components/Themed";

interface SlipItemProps {
  selection: SelectedBet; // Replace with your selection type
  showStakeInput?: boolean;
  onStakeChange?: (stake: string) => void;
}

const SlipItem = ({
  selection,
  showStakeInput = false,
  onStakeChange,
}: SlipItemProps) => {
  const [stake, setStake] = useState("");
  const { global_variables } = useAppSelector((state) => state.app);
  const { removeBet } = useBetting();
  const handleStakeChange = (text: string) => {
    const cleaned = text.replace(/[^\d.]/g, "");
    setStake(cleaned);
    if (onStakeChange) {
      onStakeChange(cleaned);
    }
  };

  const potentialWin = stake
    ? (parseFloat(stake) * Number(selection.game.odds ?? 0)).toFixed(2)
    : "0.00";

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.header}>
        <View style={styles.matchInfo}>
          <Text style={styles.matchName} numberOfLines={1}>
            {selection.game?.event_name}
          </Text>
          <Text style={styles.tournament} numberOfLines={1}>
            {selection.game?.outcome_name}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() =>
            removeBet({
              event_id: selection.game_id,
              display_name: selection.game.display_name,
            })
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Selection Details */}
      <View style={styles.selectionRow}>
        <View style={styles.selectionInfo}>
          <Text style={styles.marketName}>{selection.market_name}</Text>
          <Text style={styles.outcomeName}>
            {selection.game.display_name || selection.game.outcome_name}
          </Text>
        </View>

        <View style={styles.oddsContainer}>
          <Text style={styles.odds}>
            {Number(selection.game.odds ?? 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Stake Input for Single Bets */}
      {showStakeInput && (
        <View style={styles.stakeSection}>
          <View style={styles.stakeInputContainer}>
            <Input
              value={stake}
              placeholder="0.00"
              onChangeText={handleStakeChange}
              keyboardType="numeric"
              num_select_placeholder={global_variables?.currency_code}
              type="num_select"
              wrapperStyle={styles.stakeInputWrapper}
              inputStyle={styles.stakeInputText}
              suffixStyle={styles.stakeSuffix}
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Potential Win */}
          {stake && parseFloat(stake) > 0 && (
            <View style={styles.potentialWinRow}>
              <Text style={styles.potentialWinLabel}>Win:</Text>
              <CurrencyFormatter
                amount={parseFloat(potentialWin)}
                textStyle={styles.potentialWinValue}
                decimalStyle={styles.potentialWinDecimal}
                allowToggle={false}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SlipItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  matchInfo: {
    flex: 1,
    marginRight: 8,
  },
  matchName: {
    fontSize: 14,
    // fontWeight: "600",
    fontFamily: "PoppinsSemibold",
    color: "#111827",
    marginBottom: 2,
  },
  tournament: {
    fontSize: 12,
    fontFamily: "PoppinsSemibold",
    color: "#6b7280",
  },
  removeButton: {
    padding: 4,
  },
  selectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  selectionInfo: {
    flex: 1,
    marginRight: 12,
  },
  marketName: {
    fontSize: 12,
    color: "#6b7280",
    // marginBottom: 2,
  },
  outcomeName: {
    fontSize: 13,
    fontFamily: "PoppinsSemibold",
    color: "#111827",
  },
  oddsContainer: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  odds: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  // Stake Section
  stakeSection: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  stakeInputContainer: {},
  stakeInputWrapper: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    height: 38,
  },
  stakeInputText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "500",
  },
  stakeSuffix: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },
  potentialWinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  potentialWinLabel: {
    fontSize: 13,
    color: "#15803d",
    fontWeight: "600",
  },
  potentialWinValue: {
    fontSize: 15,
    color: "#15803d",
    fontWeight: "700",
  },
  potentialWinDecimal: {
    fontSize: 13,
    color: "#15803d",
  },
});
