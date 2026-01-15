import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import OddsButton from "@/components/buttons/OddsButton";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { Outcome } from "@/data/types/betting.types";
import SkeletonCard from "./skeletons/SkeletonCard";
import { Text } from "@/components/Themed";

type HandicapOutcome = Outcome & {
  specifier: string;
  marketName?: string;
};

type Props = {
  fixture_data: PreMatchFixture;
  disabled?: boolean;
  is_loading?: boolean;
  market_id: number;
};

const getCleanOutcomeName = (outcomeName: string): string => {
  return outcomeName.replace(/\s*\([^)]*\)\s*$/, "").trim();
};

const HandicapMarket = ({
  fixture_data,
  disabled,
  is_loading,
  market_id,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const outcomes =
    fixture_data?.outcomes?.filter(
      (outcome) => (outcome.marketID || outcome.marketId) === market_id
    ) || [];
  const title =
    outcomes.find((item) => !!item.marketName)?.marketName || "Handicap Market";
  if (is_loading) return <SkeletonCard />;
  if (outcomes.length === 0) return null;

  // Parse handicap outcomes to group by handicap values
  const handicapGroups: Record<
    string,
    {
      handicapValue: string;
      homeHandicap: number;
      awayHandicap: number;
      outcomes: Record<string, HandicapOutcome>;
    }
  > = {};
  outcomes.forEach((outcome) => {
    const specifier = outcome.specifier || "";
    const handicapMatch = specifier.match(/hcp=([+-]?\d+):([+-]?\d+)/);
    if (!handicapMatch) return;
    const homeHandicap = parseInt(handicapMatch[1]);
    const awayHandicap = parseInt(handicapMatch[2]);
    const handicapValue = `${homeHandicap}:${awayHandicap}`;
    if (!handicapGroups[handicapValue]) {
      handicapGroups[handicapValue] = {
        handicapValue,
        homeHandicap,
        awayHandicap,
        outcomes: {},
      };
    }
    let outcomeType = "";
    const displayName = outcome.displayName?.toLowerCase() || "";
    const outcomeName = outcome.outcomeName?.toLowerCase() || "";
    if (outcome.outcomeID === "1711") {
      outcomeType = "1";
    } else if (outcome.outcomeID === "1712") {
      outcomeType = "x";
    } else if (outcome.outcomeID === "1713") {
      outcomeType = "2";
    } else if (displayName.includes(": 1") || displayName.includes("(1)")) {
      outcomeType = "1";
    } else if (
      displayName.includes(": x") ||
      displayName.includes("draw") ||
      outcomeName.includes("draw")
    ) {
      outcomeType = "x";
    } else if (displayName.includes(": 2") || displayName.includes("(2)")) {
      outcomeType = "2";
    }
    if (outcomeType) {
      handicapGroups[handicapValue].outcomes[outcomeType] =
        outcome as HandicapOutcome;
    }
  });
  const handicapValues = Object.keys(handicapGroups).sort((a, b) => {
    const [aHome, aAway] = a.split(":").map(Number);
    const [bHome, bAway] = b.split(":").map(Number);
    const aDiff = aHome - aAway;
    const bDiff = bHome - bAway;
    return aDiff - bDiff;
  });
  const getOutcomeHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "1": "1", x: "X", "2": "2" };
    Object.values(handicapGroups).forEach((group) => {
      Object.entries(group.outcomes).forEach(([outcomeType, outcome]) => {
        if (outcome && outcome.outcomeName) {
          const cleanName = getCleanOutcomeName(outcome.outcomeName);
          if (cleanName) {
            headers[outcomeType] = cleanName;
          }
        }
      });
    });
    return headers;
  };
  if (handicapValues.length === 0) return null;
  return (
    <View style={[styles.card]}>
      <TouchableOpacity
        style={styles.headerBtn}
        onPress={() => setIsCollapsed((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.headerRow}>
          <Ionicons
            name={
              isCollapsed ? "chevron-forward-outline" : "chevron-down-outline"
            }
            size={18}
            color="#222"
          />
          <Text style={styles.title}>{title}</Text>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#888"
            style={{ marginLeft: 4 }}
          />
        </View>
      </TouchableOpacity>
      {!isCollapsed && (
        <ScrollView style={{ maxHeight: 400 }}>
          <View>
            {/* X-axis Headers - Show team names */}
            <View style={styles.headerGridRow}>
              <Text style={[styles.axisLabel, { minWidth: 48 }]}></Text>
              <Text
                style={[
                  styles.axisLabel,
                  { fontSize: 10.2, flex: 1, textAlign: "center" },
                ]}
              >
                {getOutcomeHeaders()["1"]}
              </Text>
              <Text
                style={[
                  styles.axisLabel,
                  { fontSize: 10.2, flex: 1, textAlign: "center" },
                ]}
              >
                {getOutcomeHeaders()["x"]}
              </Text>
              <Text
                style={[
                  styles.axisLabel,
                  { fontSize: 10.2, flex: 1, textAlign: "center" },
                ]}
              >
                {getOutcomeHeaders()["2"]}
              </Text>
            </View>
            {/* Handicap Rows */}
            {handicapValues.map((handicapValue, index) => {
              const group = handicapGroups[handicapValue];
              const outcomeTypes = ["1", "x", "2"];
              return (
                <View key={handicapValue} style={styles.gridRow}>
                  <View style={styles.axisCell}>
                    <Text style={styles.axisLabel}>{group.handicapValue}</Text>
                  </View>
                  {outcomeTypes.map((outcomeType, outcomeIndex) => {
                    const outcome = group.outcomes[outcomeType];
                    return (
                      <View style={{ flex: 1 }} key={outcomeType}>
                        <OddsButton
                          outcome={outcome as Outcome}
                          disabled={disabled || !outcome}
                          fixture_data={fixture_data}
                          game_id={Number(fixture_data?.gameID)}
                          show_display_name={false}
                          height={44}
                          rounded={
                            index === 0
                              ? outcomeIndex === 0
                                ? {
                                    borderTopLeftRadius: 6,
                                  }
                                : outcomeIndex === outcomeTypes.length - 1
                                  ? { borderTopRightRadius: 6 }
                                  : {}
                              : index === handicapValues.length - 1
                                ? outcomeIndex === 0
                                  ? {
                                      borderBottomLeftRadius: 6,
                                    }
                                  : outcomeIndex === outcomeTypes.length - 1
                                    ? { borderBottomRightRadius: 6 }
                                    : {}
                                : {}
                          }
                        />
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    padding: 6,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
  },
  headerBtn: {
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "600",
    fontSize: 12,
    fontFamily: "PoppinsSemibold",
    color: "#222",
    marginLeft: 6,
  },
  skeleton: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
  headerGridRow: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 4,
    paddingHorizontal: 2,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 2,
    paddingRight: 8,
  },
  axisCell: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  axisLabel: {
    fontSize: 12,
    fontFamily: "PoppinsSemibold",
    color: "#444",
    // letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
export default HandicapMarket;
