import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useFixturesQuery } from "@/store/services/bets.service";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { setFixtures } from "@/store/features/slice/fixtures.slice";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import {
  useGameListQuery,
  useGamesCategoriesQuery,
} from "@/store/services/gaming.service";
import { casinoNav, categoryIconMap, SportName } from "@/data/nav/data";
import { Game } from "@/store/services/types/responses";
import GameCard, { EmptyState } from "@/components/cards/GameCard";
import { router } from "expo-router";
import { setTabName } from "@/store/features/slice/app.slice";
import { Text } from "@/components/Themed";

export default function TabOneScreen() {
  const { data: categories_data, isLoading: categoriesLoading } =
    useGamesCategoriesQuery();
  const categories = Array.isArray(categories_data?.data)
    ? categories_data.data
    : [];
  // Build sportsNav first
  const sportsNav = (categories || []).map((cat) => ({
    cat_id: cat.id,
    name: cat.name,
    link: `/sports/${cat.sportID}`,
  }));
  const allTabs = useMemo(() => [...casinoNav, ...sportsNav], [sportsNav]);
  const [selectedTab, setSelectedTab] = useState(
    () => casinoNav[0]?.name || "discover"
  );
  const selectedSportsTab = sportsNav.find((tab) => tab.name === selectedTab);
  const selectedCategoryId =
    selectedSportsTab?.cat_id || categories?.[0]?.categoryID || "17";
  const {
    data: game_list_data,
    isFetching: gameListLoading,
    refetch: refetchGameList,
  } = useGameListQuery({ category_id: selectedCategoryId });
  const game_list: Game[] = Array.isArray(game_list_data?.data)
    ? game_list_data.data
    : [];

  // Types for category grouping
  type CategoryOrderItem = { name: string; id: string | number };
  type GamesByCategory = {
    [catName: string]: { id: string | number; games: Game[] };
  };

  const gamesByCategory: GamesByCategory = {};
  let categoryOrder: CategoryOrderItem[] = [];
  if (selectedTab.toLowerCase() === "discover") {
    game_list.forEach((game) => {
      (game.categories || []).forEach((cat) => {
        if (!gamesByCategory[cat.name]) {
          gamesByCategory[cat.name] = { id: cat.id, games: [] };
        }
        gamesByCategory[cat.name].games.push(game);
      });
    });
    categoryOrder = Object.keys(gamesByCategory).map((catName) => ({
      name: catName,
      id: gamesByCategory[catName].id,
    }));
  }
  const { data: fixtures_data, isSuccess: is_success } = useFixturesQuery({
    tournament_id: "0",
    sport_id: "1",
    period: "all",
    market_id: "1",
    // markets: "",
    specifier: "",
  });
  const dispatch = useAppDispatch();
  const { top_bets: _top_bets } = useAppSelector((state) => state.fixtures);

  useEffect(() => {
    if (is_success) {
      const fixtures = Array.isArray(fixtures_data.fixtures)
        ? fixtures_data.fixtures.map((tem) => ({
            ...tem,
            event_type: "pre",
            status: (tem as any).status ?? 0,
          }))
        : [];
      dispatch(
        setFixtures({
          ...fixtures_data,
          markets: fixtures_data?.markets ?? [],
          fixtures: fixtures as unknown as PreMatchFixture[],
        })
      );
    }
  }, [is_success]);

  console.log(
    "[GAMES_BY_CATEGORY]",
    "gamesByCategory",
    JSON.stringify(gamesByCategory["Crash Games"])
  );

  // Empty state component
  // const EmptyState = ({ message = "No games found." }) => (
  //   <View style={styles.emptyStateContainer}>
  //     <Ionicons
  //       name="sad-outline"
  //       size={48}
  //       color="#aaa"
  //       style={{ marginBottom: 8 }}
  //     />
  //     <Text style={styles.emptyStateText}>{message}</Text>
  //   </View>
  // );

  // Render grouped games by category
  return (
    <View style={styles.screenContainer}>
      <View style={styles.top_bar}>
        <FlatList
          data={allTabs}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.top_bar_item,
                item.name === selectedTab
                  ? { borderColor: "#ffffff", borderWidth: 2 }
                  : {},
              ]}
              key={item.name}
              onPress={() => {
                setSelectedTab(item.name);
                if (sportsNav.some((tab) => tab.name === item.name)) {
                  refetchGameList();
                }
              }}
            >
              {/* {item?.icon} */}
              {categoryIconMap({
                font_size: 26,
                color: item.name === selectedTab ? "#fff" : "#B9B9BA",
                name: item.name,
              })}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.top_bar_item_text,
                  {
                    color: item.name === selectedTab ? "#fff" : "#B9B9BA",
                  },
                ]}
              >
                {(item.name || "")?.toUpperCase()}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.name}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      {/* Only group by category for 'discover' tab, otherwise just show games for selected tab */}
      {selectedTab.toLowerCase() === "discover" ? (
        categoryOrder.length === 0 && !gameListLoading ? (
          <EmptyState message="No games found in any category." />
        ) : (
          <FlatList
            data={categoryOrder}
            keyExtractor={(cat, index) => String(cat.id) + "-" + String(index)}
            renderItem={({ item: cat }) => (
              <View key={cat.id} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{cat.name}</Text>
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => {
                      dispatch(setTabName(cat.name));
                      router.push(`/(category)/${cat.id}`);
                    }}
                  >
                    <Text style={styles.showMoreText}>SHOW MORE</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={
                    gameListLoading
                      ? Array.from({ length: 6 })
                      : gamesByCategory[cat.name]?.games
                  }
                  horizontal
                  keyExtractor={(game, idx) => String(idx)}
                  renderItem={({ item: game, index }) =>
                    gameListLoading ? (
                      <GameCard isLoading={true} />
                    ) : (
                      <GameCard game={game as Game} />
                    )
                  }
                  showsHorizontalScrollIndicator={true}
                  ItemSeparatorComponent={() => (
                    <View style={styles.horizontalSeparator} />
                  )}
                  ListEmptyComponent={
                    !gameListLoading ? (
                      <EmptyState message="No games found in this category." />
                    ) : null
                  }
                />
              </View>
            )}
            ListFooterComponent={<View style={{ height: 40 }} />}
          />
        )
      ) : game_list.length === 0 && !gameListLoading ? (
        <EmptyState message="No games found." />
      ) : (
        <View style={styles.otherTabSection}>
          <Text style={styles.otherTabTitle}>{selectedTab}</Text>
          <ScrollView>
            <View style={styles.otherTabGamesContainer}>
              {
                /* Games list for selected tab */
                gameListLoading
                  ? Array.from({ length: 6 }).map((_, idx) => (
                      <GameCard key={idx} isLoading={true} />
                    ))
                  : game_list.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))
              }
            </View>
          </ScrollView>
        </View>
      )}

      {/* <BetslipButton count={0} onPress={handleBetslipPress} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "rgb(6,0,25)",
    paddingVertical: 8,
    gap: 4,
  },
  top_bar: {
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: "rgb(6,0,25)",
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
  top_bar_item: {
    borderColor: "#2a2a2a",
    borderWidth: 1,
    borderRadius: 4,
    height: 70,
    width: 100,
    marginInline: 2,
    padding: 2,
    paddingBlock: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "rgb(6,0,25)",
    gap: 4,
  },
  top_bar_item_text: {
    color: "#B9B9BA",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "PoppinsSemibold",
  },
  categorySection: {
    width: "100%",
    backgroundColor: "rgb(6,0,25)",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgb(6,0,25)",
    padding: 8,
  },
  categoryTitle: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 22,
  },
  showMoreButton: {
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    backgroundColor: "#161616",
  },
  showMoreText: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.7,
    fontWeight: "600",
  },

  horizontalSeparator: {
    width: 8,
    backgroundColor: "rgb(6,0,25)",
  },
  otherTabSection: {
    backgroundColor: "rgb(6,0,25)",
    width: "100%",
  },
  otherTabTitle: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 22,
    marginLeft: 12,
    // marginBottom: 8,
  },
  otherTabGamesContainer: {
    flexDirection: "row",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    width: "100%",
    gap: 4,
    backgroundColor: "rgb(6,0,25)",
  },
  otherTabGameCard: {
    width: "49.2%",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#18181b",
    elevation: 2,
  },

  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 100,
    backgroundColor: "rgb(6,0,25)",
  },
  emptyStateText: {
    color: "#aaa",
    fontSize: 18,
    textAlign: "center",
    marginTop: 4,
  },
});
