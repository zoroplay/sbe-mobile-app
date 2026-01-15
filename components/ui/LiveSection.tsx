import {
  Animated,
  Easing,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import {
  selectLiveFixtures,
  updateLiveFixture,
  updateLiveFixtureOutcome,
} from "@/store/features/slice/live-games.slice";
import { useLiveMqtt } from "@/hooks/useMqtt";
import { useSportsHighlightLiveQuery } from "@/store/services/bets.service";
import FixturesBlock from "../fixtures/FixturesBlock";
import { router } from "expo-router";
import { Text } from "../Themed";

const LiveSection = () => {
  const { live_fixtures, markets } = useAppSelector(
    (state) => state.live_games
  );
  // const {
  //   subscribeToLiveOdds,
  //   subscribeToLiveBetStop,
  //   subscribeToLiveFixtureChange,
  // } = useLiveMqtt();
  const dispatch = useAppDispatch();
  const [selectedSport, setSelectedSport] = useState<{
    sport_id: string;
    sport_name: string;
  } | null>(null);

  // Select the first sport tab by default
  useEffect(() => {
    if (!selectedSport && live_fixtures.length > 0) {
      const seen = new Set();
      const first = live_fixtures.find((f) => {
        if (seen.has(f.sportID)) return false;
        seen.add(f.sportID);
        return true;
      });
      if (first) {
        setSelectedSport({
          sport_id: first.sportID,
          sport_name: first.sportName,
        });
      }
    }
  }, [live_fixtures, selectedSport]);
  const {
    data: liveData,
    isLoading: liveLoading,
    error: liveError,
    refetch,
  } = useSportsHighlightLiveQuery({
    sport_id: "0", // 0 for all sports
    markets: "1,10,18", // 1X2, DC, Over/Under markets
  });

  const handleLiveBetStop = useCallback(
    (data: any) => {
      const matchId = data.event_id || data.match_id;
      if (!matchId) return;

      dispatch(
        updateLiveFixture({
          matchID: matchId.toString(),
          matchStatus: "1", // Suspended
        })
      );
    },
    [dispatch]
  );
  // Reset selectedSport if it is no longer present in live_fixtures
  useEffect(() => {
    if (
      selectedSport &&
      !live_fixtures.some((f) => f.sportID === selectedSport.sport_id)
    ) {
      setSelectedSport(null);
    }
  }, [live_fixtures, selectedSport]);
  const handleLiveFixtureChange = (data: any) => {
    const matchId = data.event_id || data.match_id;
    if (!matchId || !data.sport_event_status) return;

    const matchStatus = data.sport_event_status.match_status || 0;
    const homeScore = data.sport_event_status.home_score || 0;
    const awayScore = data.sport_event_status.away_score || 0;

    dispatch(
      updateLiveFixture({
        matchID: matchId.toString(),
        homeScore: String(homeScore),
        awayScore: String(awayScore),
        matchStatus: String(matchStatus),
      })
    );
  };
  const handleLiveOddsChange = useCallback(
    (data: any) => {
      const matchId = data.event_id || data.match_id;
      if (!matchId) return;

      const markets = data.markets || data.odds?.markets || [];
      markets.forEach((market: any) => {
        const outcomes = market.outcomes || market.outcome || [];
        outcomes.forEach((outcome: any) => {
          dispatch(
            updateLiveFixtureOutcome({
              matchID: matchId.toString(),
              outcomeID: outcome.id,
              updates: {
                odds: outcome.odds,
                active:
                  typeof outcome.active === "boolean"
                    ? outcome.active
                      ? 1
                      : 0
                    : outcome.active || 0,
                status: market.status || 0,
              },
            })
          );
        });
      });
    },
    [dispatch]
  );

  // useEffect(() => {
  //   const unsubscribeLiveOdds = subscribeToLiveOdds(handleLiveOddsChange);
  //   const unsubscribeLiveBetStop = subscribeToLiveBetStop(handleLiveBetStop);
  //   const unsubscribeLiveFixtureChange = subscribeToLiveFixtureChange(
  //     handleLiveFixtureChange
  //   );
  //   return () => {
  //     unsubscribeLiveOdds();
  //     unsubscribeLiveBetStop();
  //     unsubscribeLiveFixtureChange();
  //   };
  // }, [
  //   subscribeToLiveOdds,
  //   subscribeToLiveBetStop,
  //   subscribeToLiveFixtureChange,
  // ]);
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    let loop: any;
    if (liveLoading) {
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
  }, [liveLoading, pulseAnim]);

  // Group fixtures by sportID
  const fixturesBySport = live_fixtures.reduce(
    (acc, fixture) => {
      if (!acc[fixture.sportID]) acc[fixture.sportID] = [];
      acc[fixture.sportID].push(fixture);
      return acc;
    },
    {} as Record<string, typeof live_fixtures>
  );

  // Determine which fixtures to show for the selected tab
  const shownFixtures = selectedSport
    ? fixturesBySport[selectedSport.sport_id] || []
    : live_fixtures;

  // Filter markets to only those present in the shownFixtures
  const filteredMarkets = markets.filter((market) =>
    shownFixtures.some((fixture) =>
      fixture.outcomes?.some?.(
        (outcome) =>
          outcome.marketID?.toString() === market.marketID?.toString()
      )
    )
  );

  return (
    <View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 4,
          backgroundColor: "rgb(6,0,25)",
        }}
      >
        <View
          style={{
            padding: 6,
            paddingTop: 10,
            paddingBottom: 4,
            backgroundColor: "rgb(6,0,25)",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              color: "#f1f1f1",
            }}
          >
            Live
          </Text>
        </View>
        <View
          style={{
            width: 1,
            height: "100%",
            backgroundColor: "#4a4a4a",
          }}
        />
        <View style={{ padding: 6, backgroundColor: "rgb(6,0,25)" }}>
          {liveLoading ? (
            <View style={{ flexDirection: "row" }}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Animated.View
                  key={idx}
                  style={{
                    width: 80,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: "#222",
                    marginRight: 8,
                    // marginBottom: 8,
                    opacity: pulseAnim,
                  }}
                />
              ))}
            </View>
          ) : (
            <FlatList
              data={(() => {
                const seen = new Set();
                return live_fixtures
                  .filter((f) => {
                    if (seen.has(f.sportID)) return false;
                    seen.add(f.sportID);
                    return true;
                  })
                  .map((f) => ({
                    sport_id: f.sportID,
                    name: f.sportName,
                  }));
              })()}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSport({
                      sport_id: item.sport_id,
                      sport_name: item.name,
                    });
                    setTimeout(() => {
                      refetch();
                    }, 50);
                  }}
                  key={item.name}
                  style={{
                    backgroundColor: "rgb(6,0,25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 4,
                    paddingVertical: 8,
                    position: "relative",
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontWeight: "600",
                      letterSpacing: 0.6,
                      fontSize: 16,
                    }}
                  >
                    {item.name}
                  </Text>
                  {selectedSport &&
                    selectedSport.sport_id === item.sport_id && (
                      <View
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: 0,
                          height: 3,
                          backgroundColor: "#C72C3B",
                          borderRadius: 2,
                        }}
                      />
                    )}
                </TouchableOpacity>
              )}
              keyExtractor={(item) => String(item.name)}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View style={styles.horizontalSeparator} />
              )}
            />
          )}
        </View>
      </View>
      <FixturesBlock
        markets={filteredMarkets}
        fixtures={shownFixtures.slice(0, 3)}
        isLoading={liveLoading}
      />

      {/* Show 'View All Live' if more fixtures exist */}
      {shownFixtures.length > 3 && (
        <TouchableOpacity
          onPress={() => {
            router.push("/live");
          }}
          style={{
            alignSelf: "flex-end",

            marginRight: 12,
            paddingVertical: 2,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
            View All Live {shownFixtures.length}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default LiveSection;

const styles = StyleSheet.create({
  horizontalSeparator: {
    width: 4,
    backgroundColor: "rgb(6,0,25)",
  },
});
