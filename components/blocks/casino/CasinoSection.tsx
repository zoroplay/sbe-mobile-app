import React from "react";
import { View, FlatList, TouchableOpacity, Easing } from "react-native";
import CasinoCard from "./CasinoCard";
import { Animated } from "react-native";
import { useFixturesQuery } from "@/store/services/bets.service";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  useGameProviderListQuery,
  useGamesCategoriesQuery,
} from "@/store/services/gaming.service";
import { Game, GameCategory } from "@/store/services/types/responses";
import { categoryIconMap } from "@/data/nav/data";
import { Text } from "@/components/Themed";
import { EmptyState } from "@/components/cards/GameCard";

const tournamentLogos: Record<string, any> = {
  // Example: [tournamentID]: require('../assets/images/la-liga.png'),
  // Add your tournamentID to logo mapping here
  // '1': require('../assets/images/la-liga.png'),
};

const CasinoSection: React.FC<{ is_loading?: boolean }> = ({ is_loading }) => {
  const { data: categories_data, isLoading: categoriesLoading } =
    useGamesCategoriesQuery();
  const categories = Array.isArray(categories_data?.data)
    ? categories_data.data
    : [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected =
    categories && categories.length > 0 ? categories[selectedIdx] : null;

  // Only call the query if selected exists
  const { data: fixtures_data } = useFixturesQuery(
    selected
      ? {
          tournament_id: String(selected.tournamentID),
          sport_id: String(selected.sportID),
          period: "all",
          market_id: "1",
          specifier: "",
        }
      : {
          tournament_id: "",
          sport_id: "",
          period: "all",
          market_id: "1",
          specifier: "",
        }
  );
  const {
    data: game_list_data,
    isFetching: gameListLoading,
    refetch: refetchGameList,
  } = useGameProviderListQuery({ category_id: String(selected?.id) });
  const game_list: Game[] = Array.isArray(game_list_data?.data)
    ? game_list_data.data
    : [];
  // Loading skeleton for CasinoCard
  const pulseAnim = React.useRef(new Animated.Value(0.5)).current;
  React.useEffect(() => {
    let loop: any;
    if (gameListLoading) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [gameListLoading, pulseAnim]);

  const renderLoadingCard = (idx: number) => (
    <Animated.View
      key={idx}
      style={{
        width: 180,
        height: 160,
        borderRadius: 6,
        backgroundColor: "#232b3b",
        marginHorizontal: 4,
        opacity: pulseAnim,
        overflow: "hidden",
        justifyContent: "flex-end",
      }}
    >
      <View style={{ width: "100%", height: 120, backgroundColor: "#222" }} />
      <View
        style={{
          height: 20,
          backgroundColor: "#2a3350",
          margin: 10,
          borderRadius: 4,
        }}
      />
    </Animated.View>
  );

  // const renderEmptyState = () => (
  //   <View
  //     style={{
  //       alignItems: "center",
  //       justifyContent: "center",
  //       width: 200,
  //       height: 120,
  //       margin: 20,
  //     }}
  //   >
  //     <MaterialIcons name="sentiment-dissatisfied" size={48} color="#555" />
  //     <Text style={{ color: "#aaa", fontSize: 16, marginTop: 8 }}>
  //       No games found.
  //     </Text>
  //   </View>
  // );

  return (
    <View
      style={{
        display: "flex",
        gap: 6,
        paddingVertical: 10,
      }}
    >
      <View style={{ display: "flex", flexDirection: "row", width: "100%" }}>
        <FlatList
          data={categories}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal
          renderItem={({
            item,
            index,
          }: {
            item: GameCategory;
            index: number;
          }) => {
            const isSelected = index === selectedIdx;
            return (
              <View style={{ position: "relative", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => setSelectedIdx(index)}
                  style={{
                    padding: 4,
                    paddingInline: 6,
                    borderWidth: 2,
                    borderColor: isSelected ? "#9c9c9c" : "#6a6a6a",
                    backgroundColor: isSelected ? "#1a2233" : "transparent",
                    borderRadius: 30,
                    marginLeft: 10,
                    alignItems: "center",
                    flexDirection: "row",
                    height: 42,
                  }}
                >
                  {categoryIconMap({
                    font_size: 24,
                    color: "#dddddd",
                    name: item.name,
                  })}
                  {isSelected ? (
                    <Text
                      style={{
                        color: isSelected ? "#fff" : "#ccc",
                        fontSize: 12,
                        marginInline: 4,
                        fontWeight: isSelected ? "600" : "normal",
                        fontFamily: "PoppinsSemibold",
                      }}
                    >
                      {item.name}
                    </Text>
                  ) : null}
                </TouchableOpacity>
                {isSelected ? (
                  <MaterialIcons
                    name="arrow-drop-down"
                    size={28}
                    color="#f3f3f3"
                    style={{
                      position: "absolute",
                      top: 30,
                      left: "50%",
                      marginLeft: -14,
                      zIndex: 2,
                      elevation: 2,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1,
                    }}
                  />
                ) : null}
              </View>
            );
          }}
        />
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}
      >
        {gameListLoading ? (
          <FlatList
            data={Array.from({ length: 6 })}
            horizontal
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ index }) => renderLoadingCard(index)}
          />
        ) : game_list.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={game_list}
            horizontal
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => <CasinoCard game={item} />}
          />
        )}
      </View>
    </View>
  );
};

export default CasinoSection;
