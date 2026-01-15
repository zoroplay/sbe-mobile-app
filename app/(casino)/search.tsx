import GameCard, { EmptyState } from "@/components/cards/GameCard";
import SingleSearchInput from "@/components/inputs/SingleSearchInput";
import {
  useGameProviderListQuery,
  useLazyGameProviderListQuery,
} from "@/store/services/gaming.service";
import { Game } from "@/store/services/types/responses";
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function ProviderDetailPage() {
  const [game_name, setGameName] = React.useState<string>("");
  const [fetchGameList, { data: game_list_data, isFetching: gameListLoading }] =
    useLazyGameProviderListQuery();
  const game_list: Game[] = Array.isArray(game_list_data?.data)
    ? game_list_data.data
    : [];

  return (
    <View style={{ backgroundColor: "rgb(6,0,25)", flex: 1, height: "100%" }}>
      <View style={styles.searchBox}>
        <SingleSearchInput
          value={game_name}
          placeholder="Search for your favourite game"
          onSearch={(text) => {
            setGameName(text);
            fetchGameList({ game_name: text });
          }}
          searchState={{
            isValid: false,
            isNotFound: false,
            isLoading: gameListLoading,
            message: "",
          }}
        />
      </View>
      <ScrollView>
        <View style={styles.otherTabSection}>
          <View style={styles.otherTabGamesContainer}>
            {
              /* Games list for selected tab */
              game_list.length === 0 && !gameListLoading ? (
                <EmptyState message="No games found." />
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
    </View>
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
    gap: 6,
    backgroundColor: "rgb(6,0,25)",
  },
  searchBox: {
    // margin: 8,
    padding: 12,
    paddingBlock: 16,
    paddingBottom: 12,
    borderRadius: 6,
  },
});
