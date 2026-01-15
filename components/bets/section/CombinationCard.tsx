import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import OddsButton from "@/components/buttons/OddsButton";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { Ionicons } from "@expo/vector-icons";
import { Outcome } from "@/data/types/betting.types";
import SkeletonCard from "./skeletons/SkeletonCard";
import { Text } from "@/components/Themed";

type Props = {
  fixture_data: PreMatchFixture;
  disabled?: boolean;
  market_id: number;
  is_loading?: boolean;
};

const CombinationCard = ({
  fixture_data,
  disabled,
  market_id,
  is_loading,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Theme mock
  const marketCardBg = "#fff";
  const marketCardBorder = "#e5e7eb";

  const outcomes =
    fixture_data?.outcomes?.filter(
      (outcome) => (outcome.marketID || outcome.marketId) === market_id
    ) || [];

  // Simple parsing for grid structure (mock)
  // In real app, use the full parsing logic from your web version
  const primaryOptions = ["1", "x", "2"];
  const secondaryOptions = ["gg", "ng"];
  // Structure: primary -> secondary -> outcome
  const structure: Record<string, Record<string, Outcome>> = {};
  outcomes.forEach((outcome) => {
    // Mock parsing: assign by displayName
    const name = outcome.displayName.toLowerCase();
    let primary = "";
    let secondary = "";
    if (name.includes("1") && name.includes("gg")) {
      primary = "1";
      secondary = "gg";
    } else if (name.includes("1") && name.includes("ng")) {
      primary = "1";
      secondary = "ng";
    } else if (name.includes("x") && name.includes("gg")) {
      primary = "x";
      secondary = "gg";
    } else if (name.includes("x") && name.includes("ng")) {
      primary = "x";
      secondary = "ng";
    } else if (name.includes("2") && name.includes("gg")) {
      primary = "2";
      secondary = "gg";
    } else if (name.includes("2") && name.includes("ng")) {
      primary = "2";
      secondary = "ng";
    }
    if (primary && secondary) {
      if (!structure[primary]) structure[primary] = {};
      structure[primary][secondary] = outcome;
    }
  });

  let title =
    outcomes.find((item) => !!item.marketName)?.marketName ||
    "Combination Market";
  if (is_loading) return <SkeletonCard />;
  if (outcomes.length === 0) return null;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: marketCardBg, borderColor: marketCardBorder },
      ]}
    >
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
        <ScrollView horizontal>
          <View>
            {/* X-axis headers */}
            <View style={styles.gridRow}>
              <View
                style={[styles.axisCell, { backgroundColor: "transparent" }]}
              />
              <View style={[styles.gridBlock, { padding: 3 }]}>
                {secondaryOptions.map((secondary) => (
                  <View
                    key={secondary}
                    style={[
                      styles.gridCell,
                      {
                        width: `${100 / secondaryOptions.length}%`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingInline: 8,
                      },
                    ]}
                  >
                    <Text style={styles.axisLabel}>
                      {secondary.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            {/* Outcome rows */}
            {primaryOptions.map((primary, index) => (
              <View key={primary} style={styles.gridRow}>
                <View style={styles.axisCell}>
                  <Text style={styles.axisLabel}>{primary.toUpperCase()}</Text>
                </View>
                <View style={styles.gridBlock}>
                  {secondaryOptions.map((secondary, idx) => {
                    const outcome = structure[primary]?.[secondary];
                    return (
                      // <View
                      //   style={[
                      //     styles.gridCell,
                      //     {
                      //       width: `${100 / secondaryOptions.length}%`,
                      //       display: "flex",
                      //       alignItems: "center",
                      //       justifyContent: "center",
                      //       paddingInline: 8,
                      //     },
                      //   ]}
                      //   key={secondary}
                      // >
                      <OddsButton
                        outcome={outcome}
                        game_id={Number(fixture_data?.gameID)}
                        key={secondary}
                        fixture_data={fixture_data}
                        // show_display_name={true}
                        height={48}
                        disabled={disabled}
                        rounded={
                          index === 0
                            ? idx === 0
                              ? {
                                  borderTopLeftRadius: 6,
                                }
                              : idx === secondaryOptions.length - 1
                                ? { borderTopRightRadius: 6 }
                                : {}
                            : index === primaryOptions.length - 1
                              ? idx === 0
                                ? {
                                    borderBottomLeftRadius: 6,
                                  }
                                : idx === secondaryOptions.length - 1
                                  ? { borderBottomRightRadius: 6 }
                                  : {}
                              : {}
                        }
                      />
                      // </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default CombinationCard;

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderRadius: 10,
    padding: 4,
    marginBottom: 8,
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
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "130%",
  },
  axisCell: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  axisLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#444",
  },
  gridCell: {
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",

    // padding: 2,
    // width: "20%",
    // backgroundColor: "blue",
  },
  emptyCell: {
    color: "#aaa",
    fontSize: 16,
    textAlign: "center",
  },
  skeleton: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
  gridBlock: {
    display: "flex",
    flexDirection: "row",
    minWidth: 120,
    // alignItems: "center",
    // justifyContent: "center",
    // // padding: 2,
    width: "100%",
  },
});
