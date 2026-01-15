import { useAppSelector } from "@/hooks/useAppDispatch";
import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import CountriesList from "./nav-section/CountriesList";
import { Text } from "../Themed";
import FixturesBlock from "../fixtures/FixturesBlock";
import { useFixturesHighlightsQuery } from "@/store/services/bets.service";

const tabs = [
  { id: 0, name: "Highlights" },
  { id: 1, name: "Today" },
  { id: 2, name: "Countries" },
];

export default function BottomTabNav({
  sport_id,
  isLoading,
}: {
  sport_id: number;
  isLoading?: boolean;
}) {
  const {
    top_bets,
    fixtures,
    markets = [],
  } = useAppSelector((state) => state.fixtures);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch today's fixtures when Today tab is selected
  const { isFetching: isTodayLoading } = useFixturesHighlightsQuery(
    {
      sport_id: String(sport_id),
      today: selectedTab === 1 ? "1" : undefined,
    },
    {
      skip: selectedTab !== 1, // Only fetch when Today tab is selected
    },
  );

  return (
    <View style={{ flex: 1, width: "100%", backgroundColor: "rgb(6,0,25)" }}>
      <View style={{ zIndex: 10 }}>
        {/* Tabs */}
        <View
          style={{
            height: 50,
            width: "100%",
            backgroundColor: "rgb(6,0,25)",
            flexDirection: "row",
            alignItems: "flex-end",
            borderBottomWidth: 1,
            borderBottomColor: "#181a20",
          }}
        >
          {tabs.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => setSelectedTab(item.id)}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                backgroundColor: "rgb(6,0,25)",
              }}
            >
              <Text
                style={{
                  color: selectedTab === idx ? "#fff" : "#e0e0e0",
                  // fontWeight: selectedTab === idx ? "bold" : "600",
                  fontFamily: "PoppinsSemibold",

                  fontSize: 15,
                }}
              >
                {item.name}
              </Text>
              {selectedTab === item.id && (
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 3,
                    backgroundColor: "#C72C3B",
                  }}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedTab === 0 ? (
        <FixturesBlock
          markets={markets}
          fixtures={fixtures}
          isLoading={isLoading}
        />
      ) : selectedTab === 1 ? (
        <FixturesBlock
          markets={markets}
          fixtures={fixtures}
          isLoading={isLoading || isTodayLoading}
        />
      ) : selectedTab === 2 ? (
        <CountriesList sport_id={sport_id} />
      ) : (
        <></>
      )}
    </View>
  );
}
