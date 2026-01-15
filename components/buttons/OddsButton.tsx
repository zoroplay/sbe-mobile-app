import { Outcome } from "@/data/types/betting.types";
import { useBetting } from "@/hooks/useBetting";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "../Themed";

type Props = {
  outcome: Outcome;
  game_id: number;
  fixture_data: PreMatchFixture;
  show_display_name?: boolean;
  bg_color?: string;
  height?: number;
  disabled?: boolean;
  rounded?: Record<string, number>;
};

const OddsButton = ({
  outcome,
  game_id,
  fixture_data,
  show_display_name,
  bg_color = "#fff",
  height = 40,
  disabled,
  rounded = { borderRadius: 8 },
}: Props) => {
  const { checkBetSelected, toggleBet } = useBetting();

  const [is_disabled, setIsDisabled] = useState(!!disabled || !outcome);

  useEffect(() => {
    setIsDisabled(!!disabled || !outcome);
  }, [disabled, outcome]);

  const handleOddsPress = () => {
    if (!is_disabled) {
      toggleBet({
        fixture_data: fixture_data as PreMatchFixture,
        outcome_data: outcome,
        element_id: fixture_data?.matchID!,
        bet_type: "pre",
        global_vars: {},
        bonus_list: [],
      });
    }
  };

  const isSelected = checkBetSelected({
    game_id: game_id as unknown as number,
    odds_type: outcome?.displayName,
    market_id: Number(outcome?.marketID ?? outcome?.marketId),
    specifier: outcome?.specifier,
    outcome_id: outcome?.outcomeID,
  });

  // Button style logic
  const getButtonStyle = () => {
    if (is_disabled) {
      return [
        styles.button,
        { backgroundColor: "#e5e7eb", borderColor: "#d1d5db" },
      ];
    }
    if (isSelected) {
      return [styles.button, styles.selectedButton];
    }
    return [
      styles.button,
      { backgroundColor: bg_color, borderColor: "#d1d5db" },
    ];
  };

  return (
    <TouchableOpacity
      disabled={is_disabled}
      style={[...getButtonStyle(), { height, ...rounded }]}
      onPress={handleOddsPress}
      activeOpacity={0.7}
    >
      {is_disabled ? (
        <View style={styles.lockIconWrap}>
          <Feather name="lock" size={24} color="#a1a1a1" />
        </View>
      ) : (
        <>
          <View style={styles.row}>
            {show_display_name && (
              <Text
                style={[styles.displayName, isSelected && styles.selectedText]}
              >
                {outcome?.displayName}
              </Text>
            )}
            {outcome?.trend === "increase" && (
              <View style={styles.arrowUpWrap}>
                <Feather name="arrow-up" size={24} color="#10B981" />
              </View>
            )}
            {outcome?.trend === "decrease" && (
              <View style={styles.arrowDownWrap}>
                <Feather name="arrow-down" size={24} color="#EF4444" />
              </View>
            )}
          </View>
          <Text style={[styles.odds, isSelected && styles.selectedText]}>
            {outcome?.odds?.toFixed(2)}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default OddsButton;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    // width: "100%",
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedButton: {
    // Darker blue for selected state
    backgroundColor: "#1e40af", // Tailwind blue-800
    borderColor: "#2563eb", // Tailwind blue-700
  },
  selectedText: {
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  displayName: {
    fontSize: 11,
    color: "#222",
    marginRight: 4,
    textTransform: "capitalize",
  },
  odds: {
    fontFamily: "PoppinsSemibold",
    fontSize: 14,
    color: "#222",
  },
  lockIconWrap: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowUpWrap: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#10B98120",
    borderRadius: 12,
    padding: 2,
    height: 20,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowDownWrap: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF444420",
    borderRadius: 12,
    padding: 2,
    height: 20,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
