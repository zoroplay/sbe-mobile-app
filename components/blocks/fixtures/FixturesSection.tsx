import React from "react";
import { View, FlatList, Image, TouchableOpacity } from "react-native";
import FixtureCard from "./FixtureCard";
import { useAppSelector } from "@/hooks/useAppDispatch";
import { useFixturesQuery } from "@/store/services/bets.service";
import { useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { Fixture } from "@/data/types/betting.types";
import { Text } from "@/components/Themed";
import { getFirebaseImage, localImages, remoteImages } from "@/assets/images";

const tournamentLogos: Record<string, any> = {
  // Example: [tournamentID]: require('../assets/images/la-liga.png'),
  // Add your tournamentID to logo mapping here
  // '1': require('../assets/images/la-liga.png'),
};

const FixturesSection: React.FC<{ is_loading?: boolean }> = ({
  is_loading,
}) => {
  const { top_bets } = useAppSelector((state) => state.fixtures);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected =
    top_bets && top_bets.length > 0 ? top_bets[selectedIdx] : null;

  // Only call the query if selected exists
  const { data: fixtures_data } = useFixturesQuery(
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
        }
  );

  const getImageURL = (name: string) => {
    if (name == "Championship") {
      // return new URL(
      //   "../../assets/images/EFL_Championship_Logo.png",
      //   import.meta.url
      // );
      return localImages.efl_championship_logo;
    } else if (name == "Bundesliga") {
      return localImages.bundesliga_logo;
    } else {
      return { uri: getFirebaseImage(name).tournament };
    }
  };

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
          data={top_bets}
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
                        fontSize: 12,
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
          // contentContainerStyle={{ paddingBottom: 30 }}
        />
      </View>
    </View>
  );
};

export default FixturesSection;
