import React from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import FixtureCard from "./FixtureCard";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { useFixturesQuery } from "@/store/services/bets.service";
import { useState, useEffect, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Fixture } from "@/data/types/betting.types";
import { Text } from "@/components/Themed";
import { getFirebaseImage, localImages, remoteImages } from "@/assets/images";

const FixturesSection: React.FC<{ is_loading?: boolean }> = ({
  is_loading,
}) => {
  const { top_bets } = useAppSelector((state) => state.fixtures);

  // Reorder top_bets to put Soccer first
  const orderedTopBets = (() => {
    if (!top_bets || top_bets.length === 0) return top_bets;
    const arr = [...top_bets];
    // Move 'Soccer' (case-insensitive) to the front
    const soccerIndex = arr.findIndex(
      (s) => s.sportName && s.sportName.toLowerCase() === "soccer",
    );
    if (soccerIndex > 0) {
      const [soccer] = arr.splice(soccerIndex, 1);
      arr.unshift(soccer);
    }
    return arr;
  })();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected =
    orderedTopBets && orderedTopBets.length > 0
      ? orderedTopBets[selectedIdx]
      : null;

  // Only call the query if selected exists
  const {
    data: fixtures_data,
    isLoading,
    isFetching,
  } = useFixturesQuery(
    selected
      ? {
          tournament_id: String(selected.tournamentID),
          sport_id: String(selected.sportID ?? 1),
          period: "all",
          market_id: "1",
          specifier: "",
        }
      : {
          tournament_id: "17",
          sport_id: "1",
          period: "all",
          market_id: "1",
          specifier: "",
        },
  );

  const getImageURL = (name: string) => {
    if (name == "Championship") {
      return localImages.efl_championship_logo;
    } else if (name == "Bundesliga") {
      return localImages.bundesliga_logo;
    } else {
      return { uri: getFirebaseImage(name).tournament };
    }
  };

  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let loop: any;
    if (isLoading || isFetching) {
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
        ]),
      );
      loop.start();
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isLoading, isFetching, pulseAnim]);

  return (
    <View
      style={{
        display: "flex",
        gap: 6,
        // backgroundColor: "#ffffff",
        paddingVertical: 10,
      }}
    >
      <View style={{ display: "flex", flexDirection: "row", width: "100%" }}>
        <FlatList
          data={orderedTopBets}
          keyExtractor={(_, idx) => idx.toString()}
          horizontal
          renderItem={({ item, index }) => {
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
                  <Image
                    source={getImageURL(item.tournamentName)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "#ffffff80",
                    }}
                    resizeMode="contain"
                  />
                  {isSelected ? (
                    <Text
                      style={{
                        color: isSelected ? "#fff" : "#ccc",
                        fontSize: 10,
                        marginInline: 4,
                        // fontWeight: isSelected ? "bold" : "normal",
                        fontFamily: "PoppinsSemibold",
                      }}
                    >
                      {item.tournamentName}
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
          // contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}
      >
        {isLoading || isFetching ? (
          <FlatList
            data={[1, 2, 3]}
            horizontal
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={() => (
              <Animated.View
                style={{
                  width: 300,
                  height: 150,
                  backgroundColor: "#1a2233",
                  borderRadius: 12,
                  marginLeft: 10,
                  padding: 12,
                  opacity: pulseAnim,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 12,
                      backgroundColor: "#2a3444",
                      borderRadius: 4,
                    }}
                  />
                  <View
                    style={{
                      width: 40,
                      height: 12,
                      backgroundColor: "#2a3444",
                      borderRadius: 4,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: "#2a3444",
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  />
                  <View
                    style={{
                      width: 120,
                      height: 14,
                      backgroundColor: "#2a3444",
                      borderRadius: 4,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      backgroundColor: "#2a3444",
                      borderRadius: 12,
                      marginRight: 8,
                    }}
                  />
                  <View
                    style={{
                      width: 120,
                      height: 14,
                      backgroundColor: "#2a3444",
                      borderRadius: 4,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: "#2a3444",
                      borderRadius: 6,
                    }}
                  />
                  <View
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: "#2a3444",
                      borderRadius: 6,
                    }}
                  />
                  <View
                    style={{
                      width: 80,
                      height: 32,
                      backgroundColor: "#2a3444",
                      borderRadius: 6,
                    }}
                  />
                </View>
              </Animated.View>
            )}
          />
        ) : fixtures_data?.fixtures && fixtures_data.fixtures.length > 0 ? (
          <FlatList
            data={fixtures_data?.fixtures}
            horizontal
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <FixtureCard
                outcomes={item.outcomes}
                fixture={item as unknown as Fixture}
              />
            )}
          />
        ) : (
          <View
            style={{
              width: "100%",
              padding: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="sports-soccer" size={48} color="#6a6a6a" />
            <Text
              style={{
                color: "#9c9c9c",
                fontSize: 16,
                marginTop: 12,
                fontFamily: "PoppinsSemibold",
              }}
            >
              No games available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FixturesSection;
