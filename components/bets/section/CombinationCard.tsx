import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
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
      (outcome) => (outcome.marketID || outcome.marketId) === market_id,
    ) || [];

  // Detect if this is a Winning Margin market
  const isWinningMargin = outcomes[0]?.marketName
    ?.toLowerCase()
    .includes("winning margin");

  let title =
    outcomes.find((item) => !!item.marketName)?.marketName ||
    "Combination Market";
  if (is_loading) return <SkeletonCard />;
  if (outcomes.length === 0) return null;

  if (isWinningMargin) {
    // Group by Home, Away, Draw and margin (1, 2, 3+)
    const marginOptions = ["1", "2", "3+"];
    const teamOptions = [
      { key: "home", label: "Home" },
      { key: "away", label: "Away" },
    ];
    // Structure: team -> margin -> outcome
    const marginStructure: Record<string, Record<string, Outcome>> = {};
    outcomes.forEach((outcome) => {
      const name = outcome.displayName.toLowerCase();
      let team = "";
      let margin = "";
      if (name.includes("home by 1")) {
        team = "home";
        margin = "1";
      } else if (name.includes("home by 2")) {
        team = "home";
        margin = "2";
      } else if (name.includes("home by 3+")) {
        team = "home";
        margin = "3+";
      } else if (name.includes("away by 1")) {
        team = "away";
        margin = "1";
      } else if (name.includes("away by 2")) {
        team = "away";
        margin = "2";
      } else if (name.includes("away by 3+")) {
        team = "away";
        margin = "3+";
      }
      if (team) {
        if (!marginStructure[team]) marginStructure[team] = {};
        marginStructure[team][margin] = outcome;
      }
    });
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
            <View style={{ flex: 1, width: "100%" }}>
              {/* X-axis headers */}
              <View style={styles.gridRow}>
                <View
                  style={[styles.axisCell, { backgroundColor: "transparent" }]}
                />
                <View style={[styles.gridBlock, { padding: 3 }]}>
                  {marginOptions.map((margin) => (
                    <View
                      key={margin}
                      style={[
                        styles.gridCell,
                        {
                          width: `${100 / marginOptions.length}%`,
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: 8,
                        },
                      ]}
                    >
                      <Text style={styles.axisLabel}>{margin}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {/* Outcome rows */}
              {teamOptions.map((team, index) => (
                <View key={team.key} style={styles.gridRow}>
                  <View style={styles.axisCell}>
                    <Text style={styles.axisLabel}>{team.label}</Text>
                  </View>
                  <View style={styles.gridBlock}>
                    {marginOptions.map((margin, idx) => {
                      const outcome = marginStructure[team.key]?.[margin];
                      return (
                        <View
                          key={margin}
                          style={{
                            flex: 1,
                            // width: `${100 / marginOptions.length}%`,
                            width: 80,
                          }}
                        >
                          <OddsButton
                            outcome={outcome}
                            game_id={Number(fixture_data?.gameID)}
                            fixture_data={fixture_data}
                            height={48}
                            disabled={disabled}
                            rounded={{
                              borderTopLeftRadius:
                                index === 0 && idx === 0 ? 6 : 0,
                              borderTopRightRadius:
                                index === 0 && idx === marginOptions.length - 1
                                  ? 6
                                  : 0,
                              borderBottomLeftRadius:
                                index === teamOptions.length - 1 && idx === 0
                                  ? 6
                                  : 0,
                              borderBottomRightRadius:
                                index === teamOptions.length - 1 &&
                                idx === marginOptions.length - 1
                                  ? 6
                                  : 0,
                            }}
                          />
                        </View>
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
  }

  // ...existing code for other combination types...
};

export default CombinationCard;

const styles = StyleSheet.create({
  card: {
    // shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    // borderRadius: 10,
    padding: 4,
    // marginBottom: 8,
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
    width: "100%",
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
    // minWidth: 120,
    // alignItems: "center",
    // justifyContent: "center",
    // // padding: 2,
    width: Platform.OS === "ios" ? "128%" : "118%",
    // backgroundColor: "green",
  },
});
