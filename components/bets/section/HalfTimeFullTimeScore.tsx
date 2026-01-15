import React, { useState, useMemo } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import OddsButton from "@/components/buttons/OddsButton";
import { Ionicons } from "@expo/vector-icons";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import SkeletonCard from "./skeletons/SkeletonCard";
import { Text } from "@/components/Themed";
import { OddsBtnRounded } from "./styles";
import { Outcome } from "@/data/types/betting.types";

type Props = {
  fixture_data: PreMatchFixture;
  disabled?: boolean;
  is_loading?: boolean;
  market_id: number;
};

const HalfTimeFullTimeScore = ({
  fixture_data,
  disabled,
  is_loading,
  market_id,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Theme mock
  const marketCardBg = "#fff";
  const marketCardBorder = "#e5e7eb";

  const outcomes =
    fixture_data?.outcomes?.filter(
      (outcome) => (outcome.marketID || outcome.marketId) === market_id
    ) || [];

  const title = outcomes?.[0]?.marketName || "HT/FT Correct Score";
  if (is_loading) return <SkeletonCard />;
  if (outcomes.length === 0) return null;

  // Parse and group outcomes by halftime score
  const parseScore = (outcomeScore: string) => {
    const parts = outcomeScore.split(" ");
    if (parts.length === 2) {
      return {
        halftime: parts[0],
        fulltime: parts[1],
        original: outcomeScore,
      };
    }
    return {
      halftime: outcomeScore,
      fulltime: outcomeScore,
      original: outcomeScore,
    };
  };

  // Group outcomes by halftime score
  const scoreGroups = useMemo(() => {
    const groups: { [key: string]: Outcome[] } = {};
    outcomes.forEach((outcome) => {
      const score = parseScore(
        outcome.outcomeName || outcome.displayName || ""
      );
      const htScore = score.halftime;
      if (!groups[htScore]) groups[htScore] = [];
      groups[htScore].push(outcome);
    });
    return groups;
  }, [outcomes]);

  // Helper to render a group
  const renderScoreGroup = (htScore: string, groupOutcomes: Outcome[]) => {
    if (groupOutcomes.length === 0) return null;
    // Categorize halftime scores
    const getScoreCategory = (score: string) => {
      if (score === "0:0") return { color: "", label: "Goalless HT" };
      if (score.includes("0:") || score.includes(":0"))
        return { color: "", label: "Low Scoring HT" };
      if (score === "1:1") return { color: "", label: "Balanced HT" };
      if (score.includes("4+")) return { color: "", label: "High Scoring" };
      return { color: "", label: "Active HT" };
    };
    const category = getScoreCategory(htScore);
    return (
      <View key={htScore} style={{ marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Text style={[styles.axisLabel, { marginRight: 8 }]}>
            {category.label} ({htScore})
          </Text>
          <View
            style={{
              backgroundColor: "#e5e7eb",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 2,
              marginLeft: 4,
            }}
          >
            <Text style={{ fontSize: 12, color: "#222" }}>
              {groupOutcomes.length}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {groupOutcomes.map((outcome, index) => {
            const displayScore =
              outcome.outcomeName || outcome.displayName || "Unknown";
            const isLast = index === groupOutcomes.length - 1;
            const isOddCount = groupOutcomes.length % 2 !== 0;
            return (
              <View
                style={{ flexBasis: isLast && isOddCount ? "100%" : "50%" }}
                key={outcome.outcomeID || index}
              >
                <OddsButton
                  outcome={{
                    ...outcome,
                    outcomeName: displayScore,
                    displayName: displayScore,
                  }}
                  game_id={Number(fixture_data?.gameID) as number}
                  fixture_data={fixture_data}
                  show_display_name={true}
                  height={44}
                  disabled={disabled}
                  rounded={OddsBtnRounded({
                    index,
                    length: groupOutcomes.length,
                  })}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Sort halftime groups
  const sortedHtScores = Object.keys(scoreGroups).sort((a, b) => {
    if (a === "0:0") return -1;
    if (b === "0:0") return 1;
    if (a.includes("4+")) return 1;
    if (b.includes("4+")) return -1;
    return a.localeCompare(b);
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
        <ScrollView style={{ marginTop: 8 }}>
          <View>
            {sortedHtScores.map((htScore) =>
              renderScoreGroup(htScore, scoreGroups[htScore])
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default HalfTimeFullTimeScore;

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
  axisLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#444",
  },
  skeleton: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
});
