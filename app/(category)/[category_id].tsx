import GameCard, { EmptyState } from "@/components/cards/GameCard";
import { useGameProviderListQuery } from "@/store/services/gaming.service";
import { Game } from "@/store/services/types/responses";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function ProviderDetailPage() {
  const { category_id } = useLocalSearchParams();
  const {
    data: game_list_data,
    isFetching: gameListLoading,
    refetch: refetchGameList,
  } = useGameProviderListQuery({ category_id: String(category_id) });
  const game_list: Game[] = Array.isArray(game_list_data?.data)
    ? game_list_data.data
    : [];

  return (
    <ScrollView>
      <View style={styles.otherTabSection}>
        <View style={styles.otherTabGamesContainer}>
          {
            /* Games list for selected tab */
            game_list.length === 0 && !gameListLoading ? (
              <EmptyState />
            ) : gameListLoading ? (
              Array.from({ length: 12 }).map((_, idx) => (
                <GameCard key={idx} isLoading={true} />
              ))
            ) : (
              game_list.map((game) => <GameCard key={game.id} game={game} />)
            )
          }
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  otherTabSection: {
    backgroundColor: "rgb(6,0,25)",
    width: "100%",
    padding: 6,
    paddingVertical: 12,
    paddingBottom: 40,
    height: "100%",
    minHeight: "100%",
  },

  otherTabGamesContainer: {
    flexDirection: "row",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    width: "100%",
    gap: 4,
    backgroundColor: "rgb(6,0,25)",
  },
});
