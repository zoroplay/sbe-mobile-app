import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import OddsButton from "@/components/buttons/OddsButton";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { MARKET_SECTION } from "@/data/enums/enum";
import { Outcome } from "@/data/types/betting.types";
import { Ionicons } from "@expo/vector-icons";
import SkeletonCard from "./skeletons/SkeletonCard";
import { ScrollView } from "react-native-gesture-handler";
import { Text } from "@/components/Themed";

function groupExactGoals(outcomes: Outcome[]) {
  const groups: Record<string, Outcome[]> = {};
  outcomes.forEach((outcome) => {
    const spec = outcome.specifier;
    if (!spec) return;
    if (!groups[spec]) groups[spec] = [];
    groups[spec].push(outcome);
  });
  return groups;
}

const ExactGoals = ({
  fixture_data,
  market_id = MARKET_SECTION.EXACT_GOALS,
  disabled,
  is_loading,
}: {
  fixture_data: PreMatchFixture;
  market_id?: number;
  disabled?: boolean;
  is_loading?: boolean;
}) => {
  const [is_collapsed, setIsCollapsed] = useState<boolean>(false);
  const outcomes =
    fixture_data?.outcomes?.filter(
      (outcome) => (outcome.marketID ?? outcome.marketId) === market_id
    ) || [];

  let title =
    outcomes.find((item) => !!item.marketName)?.marketName || "Exact Goals";
  const groups = groupExactGoals(outcomes);
  const specifiers = Object.keys(groups);

  if (is_loading) return <SkeletonCard />;
  // if (is_loading) return <SkeletonCard title={title} />;
  if (outcomes.length === 0) return null;

  const key = Object.keys(groups)[0];
  const length = groups[key]?.length;

  // Helper to get flexBasis % for each button based on group length
  const getButtonStyle = (count: number) => {
    // console.log("Count:", count);
    // For up to 7, use 100/count%; fallback to minWidth for more
    const widthPercent = 100 / count;
    return {
      // flexBasis: `${widthPercent}%`,
      // maxWidth: `${widthPercent}%`,
      minWidth: 48,
      width: `${widthPercent}%`,
    };
  };

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
              is_collapsed ? "chevron-forward-outline" : "chevron-down-outline"
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
      {!is_collapsed && (
        <View>
          {specifiers.map((spec) => {
            const group = groups[spec];
            const value = spec.replace("variant=sr:exact_goals:", "");
            const count = group.length;
            return (
              <View key={spec} style={styles.gridRow}>
                {/* <View style={styles.axisCell}>
                  <Text style={styles.axisLabel}>{value}</Text>
                </View> */}
                {/* <ScrollView horizontal> */}
                <View
                  style={[
                    styles.gridCell,
                    {
                      flexDirection: "row",
                    },
                  ]}
                >
                  {group
                    .sort((a, b) => {
                      const parseGoal = (g: Outcome) => {
                        if (g.displayName?.includes("+")) return 99;
                        return parseInt(g.displayName, 10) || 0;
                      };
                      return parseGoal(a) - parseGoal(b);
                    })
                    .map((outcome, index) => (
                      <View
                        key={outcome.outcomeID}
                        style={getButtonStyle(count)}
                      >
                        <View
                          style={{
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: "PoppinsSemibold",
                            }}
                          >
                            {outcome.displayName ? outcome.displayName : ""}
                          </Text>
                        </View>
                        <OddsButton
                          outcome={outcome}
                          game_id={fixture_data?.gameID as unknown as number}
                          fixture_data={fixture_data as PreMatchFixture}
                          // show_display_name={true}
                          height={48}
                          disabled={outcome ? false : true}
                          rounded={
                            index === 0
                              ? {
                                  borderTopLeftRadius: 6,
                                  borderBottomLeftRadius: 6,
                                }
                              : group.length - 1 === index
                                ? {
                                    borderTopRightRadius: 6,
                                    borderBottomRightRadius: 6,
                                  }
                                : {}
                          }
                        />
                      </View>
                    ))}
                </View>
                {/* </ScrollView> */}
              </View>
            );
          })}
        </View>
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
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "blue",
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
    width: "100%",
  },
});

export default ExactGoals;
