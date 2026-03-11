import React, { useState, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import CountriesList from "./nav-section/CountriesList";
import { Text } from "../Themed";
import FixturesBlock from "../fixtures/FixturesBlock";
import { useFixturesHighlightsQuery } from "@/store/services/bets.service";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";

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
  const [selectedTab, setSelectedTab] = useState(0);

  // Highlights tab query
  const { data: highlightsData, isFetching: isHighlightsFetching } =
    useFixturesHighlightsQuery(
      { sport_id: String(sport_id) },
      { skip: selectedTab !== 0 },
    );

  // Today tab query — only fires when tab is active
  const { data: todayData, isFetching: isTodayFetching } =
    useFixturesHighlightsQuery(
      { sport_id: String(sport_id), today: "1" },
      { skip: selectedTab !== 1, pollingInterval: 30000 },
    );

  const highlightsFixtures = useMemo(
    () =>
      (highlightsData?.fixtures ?? []).map((tem) => ({
        ...tem,
        event_type: "pre",
        status: (tem as any).status ?? 0,
      })) as unknown as PreMatchFixture[],
    [highlightsData?.fixtures],
  );
  const highlightsMarkets = useMemo(
    () => highlightsData?.markets ?? [],
    [highlightsData?.markets],
  );

  const todayFixtures = useMemo(
    () =>
      (todayData?.fixtures ?? []).map((tem) => ({
        ...tem,
        event_type: "pre",
        status: (tem as any).status ?? 0,
      })) as unknown as PreMatchFixture[],
    [todayData?.fixtures],
  );
  const todayMarkets = useMemo(
    () => todayData?.markets ?? [],
    [todayData?.markets],
  );

  return (
    <View style={{ flex: 1, width: "100%", backgroundColor: "rgb(6,0,25)" }}>
      <View style={{ zIndex: 10 }}>
        {/* Tabs */}
        <View
          style={{
            height: 40,
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
                  fontFamily: "PoppinsSemibold",
                  fontSize: 13,
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
          markets={highlightsMarkets}
          fixtures={highlightsFixtures}
          isLoading={isLoading || isHighlightsFetching}
        />
      ) : selectedTab === 1 ? (
        <FixturesBlock
          markets={todayMarkets}
          fixtures={todayFixtures}
          isLoading={isTodayFetching}
        />
      ) : selectedTab === 2 ? (
        <CountriesList sport_id={sport_id} />
      ) : (
        <></>
      )}
    </View>
  );
}
