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
  market_id?: number;
  is_loading?: boolean;
  title?: string;
};

const OverUnder = ({
  fixture_data,
  disabled,
  market_id = 1,
  is_loading,
  title: customTitle,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Theme mock
  const marketCardBg = "#fff";
  const marketCardBorder = "#e5e7eb";

  const outcomes =
    fixture_data?.outcomes?.filter(
      (outcome) => (outcome.marketID || outcome.marketId) === market_id
    ) || [];

  // Parse outcomes into pairs by specifier
  const pairsBySpecifier: Record<string, { over?: Outcome; under?: Outcome }> =
    {};
  outcomes.forEach((outcome) => {
    const spec = outcome.specifier || "";
    const name = (outcome.displayName ?? "").toLowerCase();
    if (!spec.match(/total=(\d+(?:\.\d+)?)/)) return;
    if (!pairsBySpecifier[spec]) pairsBySpecifier[spec] = {};
    if (name.includes("over")) pairsBySpecifier[spec].over = outcome;
    else if (name.includes("under")) pairsBySpecifier[spec].under = outcome;
  });

  let title =
    customTitle ||
    outcomes.find((item) => !!item.marketName)?.marketName ||
    "Over/Under";
  if (is_loading) return <SkeletonCard />;
  if (outcomes.length === 0) return null;

  // Sort specifiers by total value
  const specifiers = Object.keys(pairsBySpecifier).sort((a, b) => {
    const getVal = (spec: string) => {
      const m = spec.match(/total=(\d+(?:\.\d+)?)/);
      return m ? parseFloat(m[1]) : 0;
    };
    return getVal(a) - getVal(b);
  });

  // If no real outcomes, create dummy disabled buttons for predictable values
  const dummyValues = ["0.5", "1.5", "2.5", "3.5", "4.5"];
  const hasRealOutcomes = specifiers.length > 0;
  const displayItems = hasRealOutcomes
    ? specifiers
    : dummyValues.map((val) => `total=${val}`);

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
            {/* Column Headers */}
            <View
              style={[
                styles.gridRow,
                {
                  // marginBottom: 4,
                  paddingHorizontal: 2,
                },
              ]}
            >
              <View
                style={[styles.axisCell, { backgroundColor: "transparent" }]}
              />
              <View style={styles.gridBlock}>
                <View
                  style={[
                    styles.gridCell,
                    {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingInline: 8,
                    },
                  ]}
                >
                  <Text style={[styles.axisLabel, { fontSize: 10.2 }]}>
                    Over
                  </Text>
                </View>
                <View
                  style={[
                    styles.gridCell,
                    {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingInline: 8,
                    },
                  ]}
                >
                  <Text style={[styles.axisLabel, { fontSize: 10.2 }]}>
                    Under
                  </Text>
                </View>
              </View>
            </View>
            {/* Outcome rows */}
            {displayItems.map((spec, index) => {
              const group = hasRealOutcomes ? pairsBySpecifier[spec] || {} : {};
              const value = spec.match(/total=(\d+(?:\.\d+)?)/)?.[1] || spec;

              return (
                <View key={spec} style={styles.gridRow}>
                  <View style={styles.axisCell}>
                    <Text style={styles.axisLabel}>{value}</Text>
                  </View>
                  <View style={styles.gridBlock}>
                    <View style={styles.gridCell}>
                      <OddsButton
                        outcome={group?.over!}
                        game_id={Number(fixture_data?.gameID) as number}
                        fixture_data={fixture_data}
                        height={48}
                        disabled={!group?.over || !hasRealOutcomes}
                        rounded={
                          index === 0
                            ? {
                                borderTopLeftRadius: 6,
                              }
                            : index === displayItems.length - 1
                              ? {
                                  borderBottomLeftRadius: 6,
                                }
                              : {}
                        }
                      />
                    </View>
                    <View style={styles.gridCell}>
                      <OddsButton
                        outcome={group?.under!}
                        game_id={Number(fixture_data?.gameID) as number}
                        fixture_data={fixture_data}
                        height={48}
                        disabled={!group?.under || !hasRealOutcomes}
                        rounded={
                          index === 0
                            ? {
                                borderTopRightRadius: 6,
                              }
                            : index === displayItems.length - 1
                              ? {
                                  borderBottomRightRadius: 6,
                                }
                              : {}
                        }
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default OverUnder;

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
    fontFamily: "PoppinsSemibold",
    fontSize: 12,
    color: "#222",
    marginLeft: 6,
  },
  gridRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    // paddingRight: 2,
  },
  axisCell: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    width: "20%",
  },
  axisLabel: {
    fontSize: 12,
    fontFamily: "PoppinsSemibold",
    color: "#444",
    textTransform: "uppercase",
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
  gridCell: {
    display: "flex",
    flexDirection: "row",
    minWidth: 70,
    // alignItems: "center",
    // justifyContent: "center",
    // padding: 2,
    // backgroundColor: "red",
    width: "79%",
  },
});
