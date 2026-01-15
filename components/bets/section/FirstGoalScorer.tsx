import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import OddsButton from "@/components/buttons/OddsButton";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { Ionicons } from "@expo/vector-icons";
import SkeletonCard from "./skeletons/SkeletonCard";
import { Outcome } from "@/data/types/betting.types";
import { OddsBtnRounded, outcomes_box_styles } from "./styles";

type Props = {
  fixture_data: PreMatchFixture;
  disabled?: boolean;
  is_loading?: boolean;
  market_id: number;
};

const FirstGoalScorer = ({
  fixture_data,
  disabled,
  is_loading,
  market_id,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"odds" | "name">("odds");

  const outcomes =
    fixture_data?.outcomes?.filter(
      (outcome) => (outcome.marketID || outcome.marketId) === market_id
    ) || [];

  const title =
    outcomes.find((item) => !!item.marketName)?.marketName ||
    "First Goal Scorer";
  if (is_loading) return <SkeletonCard />;
  if (outcomes.length === 0) return null;

  // Separate "no goal" option from players
  const noGoalOutcome = outcomes.find(
    (outcome) =>
      outcome.outcomeName?.toLowerCase().includes("no goal") ||
      outcome.outcomeID === "1716"
  );
  const playerOutcomes = outcomes.filter(
    (outcome) =>
      !outcome.outcomeName?.toLowerCase().includes("no goal") &&
      outcome.outcomeID !== "1716"
  );

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = playerOutcomes;
    if (searchTerm) {
      filtered = filtered.filter((player) =>
        player.outcomeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      if (sortBy === "odds") {
        return (a.odds || 0) - (b.odds || 0);
      } else {
        const nameA = a.outcomeName || "";
        const nameB = b.outcomeName || "";
        return nameA.localeCompare(nameB);
      }
    });
  }, [playerOutcomes, searchTerm, sortBy]);

  // Group players by odds ranges
  const oddsGroups = useMemo(() => {
    const groups = {
      favorites: filteredAndSortedPlayers.filter((p) => p.odds && p.odds <= 3),
      likely: filteredAndSortedPlayers.filter(
        (p) => p.odds && p.odds > 3 && p.odds <= 7
      ),
      possible: filteredAndSortedPlayers.filter(
        (p) => p.odds && p.odds > 7 && p.odds <= 15
      ),
      longshots: filteredAndSortedPlayers.filter((p) => p.odds && p.odds > 15),
    };
    return groups;
  }, [filteredAndSortedPlayers]);

  const formatPlayerName = (name: string) => {
    if (name.includes(",")) {
      const parts = name.split(",");
      return `${parts[1]?.trim()} ${parts[0]?.trim()}`;
    }
    return name;
  };

  const renderPlayerGroup = (
    players: Outcome[],
    groupTitle: string,
    groupColor: string
  ) => {
    if (players.length === 0) return null;
    return (
      <View style={styles.playerGroupRow}>
        <View style={styles.playerGroupHeader}>
          <Text style={[styles.axisLabel, { color: groupColor }]}>
            {groupTitle}
          </Text>
          <View style={styles.playerGroupCountBox}>
            <Text style={styles.playerGroupCountText}>{players.length}</Text>
          </View>
        </View>
        <View style={styles.playersWrap}>
          {players.map((outcome, index) => {
            const displayName = formatPlayerName(
              outcome.outcomeName || "Unknown Player"
            );
            const isLast = index === players.length - 1;
            const isOddCount = players.length % 2 !== 0;

            return (
              <View
                style={[
                  styles.playerCell,
                  { flexBasis: isLast && isOddCount ? "100%" : "50%" },
                ]}
                key={outcome.outcomeID || index}
              >
                <OddsButton
                  outcome={{
                    ...outcome,
                    outcomeName: displayName,
                    displayName: displayName,
                  }}
                  game_id={Number(fixture_data?.gameID) as number}
                  fixture_data={fixture_data}
                  show_display_name={true}
                  height={48}
                  disabled={disabled}
                  rounded={OddsBtnRounded({
                    index,
                    length: players.length,
                  })}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[outcomes_box_styles.card]}>
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
            {/* No Goal option at the top */}
            {noGoalOutcome && (
              <View style={styles.specialRow}>
                <Text style={styles.specialLabel}>Special</Text>
                <OddsButton
                  key={noGoalOutcome.outcomeID}
                  outcome={noGoalOutcome}
                  game_id={Number(fixture_data?.gameID) as number}
                  fixture_data={fixture_data}
                  show_display_name={true}
                  height={44}
                  disabled={disabled}
                  // rounded={8}
                />
              </View>
            )}
            {/* Search and Filter Controls */}
            <View style={styles.searchFilterRow}>
              <View style={styles.searchLabelRow}>
                <Ionicons name="search-outline" size={16} color="#888" />
                <Text style={styles.searchLabel}>
                  Players ({playerOutcomes.length})
                </Text>
              </View>
              <View style={styles.searchInputRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search players..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholderTextColor="#aaa"
                />
                <View style={styles.sortBtnWrapper}>
                  <TouchableOpacity
                    style={styles.sortBtn}
                    onPress={() =>
                      setSortBy(sortBy === "odds" ? "name" : "odds")
                    }
                  >
                    <Text style={styles.sortBtnText}>
                      {sortBy === "odds" ? "Sort by Name" : "Sort by Odds"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* Players organized by odds groups */}
            {sortBy === "odds" && !searchTerm ? (
              <View>
                {renderPlayerGroup(
                  oddsGroups.favorites,
                  "Favorites",
                  "#10B981"
                )}
                {renderPlayerGroup(oddsGroups.likely, "Likely", "#FBBF24")}
                {renderPlayerGroup(oddsGroups.possible, "Possible", "#F59E42")}
                {renderPlayerGroup(
                  oddsGroups.longshots,
                  "Long Shots",
                  "#EF4444"
                )}
              </View>
            ) : (
              <View>
                {filteredAndSortedPlayers.length > 0 ? (
                  <View style={styles.playersWrap}>
                    {filteredAndSortedPlayers.map((outcome, index) => {
                      const displayName = formatPlayerName(
                        outcome.outcomeName || "Unknown Player"
                      );

                      return (
                        <View
                          style={styles.playerCell}
                          key={outcome.outcomeID || index}
                        >
                          <OddsButton
                            outcome={{
                              ...outcome,
                              outcomeName: displayName,
                              displayName: displayName,
                            }}
                            game_id={Number(fixture_data?.gameID) as number}
                            fixture_data={fixture_data}
                            show_display_name={true}
                            height={44}
                            disabled={disabled}
                            rounded={OddsBtnRounded({
                              index,
                              length: filteredAndSortedPlayers.length,
                            })}
                          />
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.skeleton}>
                    No players found matching "{searchTerm}"
                  </Text>
                )}
              </View>
            )}
            {/* Summary footer */}
            <Text style={styles.summaryFooter}>
              {searchTerm
                ? `${filteredAndSortedPlayers.length} of ${playerOutcomes.length} players shown`
                : `${outcomes.length} total options available`}
            </Text>
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
    elevation: 3,
    borderWidth: 1,
    borderRadius: 10,
    padding: 4,
    marginBottom: 8,
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
    fontSize: 13,
    color: "#222",
    marginLeft: 6,
  },
  skeleton: {
    textAlign: "center",
    color: "#aaa",
    padding: 16,
  },
  specialRow: {
    marginBottom: 8,
  },
  specialLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  searchFilterRow: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    marginBottom: 8,
  },
  searchLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  searchLabel: {
    fontSize: 12,
    color: "#888",
    marginLeft: 4,
  },
  searchInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 6,
    fontSize: 12,
    color: "#222",
  },
  sortBtnWrapper: {
    minWidth: 100,
  },
  sortBtn: {
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    padding: 6,
    alignItems: "center",
  },
  sortBtnText: {
    fontSize: 12,
    color: "#222",
  },
  playersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  playerCell: {
    flexBasis: "48%",
  },
  playerGroupRow: {
    marginBottom: 12,
  },
  playerGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  playerGroupCountBox: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  playerGroupCountText: {
    fontSize: 12,
    color: "#222",
  },
  axisLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#444",
    marginRight: 8,
  },
  summaryFooter: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
});
export default FirstGoalScorer;
