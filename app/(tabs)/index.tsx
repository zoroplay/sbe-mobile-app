import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import BetslipButton from "@/components/BetslipButton";
import { FlatList } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import {
  useFixturesHighlightsQuery,
  useSportsMenuQuery,
  useTopBetsQuery,
} from "@/store/services/bets.service";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import {
  categoryIconMap,
  sportIconMap,
  SportName,
  staticNav,
} from "@/data/nav/data";
import CasinoSection from "@/components/blocks/casino/CasinoSection";
import LiveSection from "@/components/ui/LiveSection";
import { Text } from "@/components/Themed";
import FixturesSection from "@/components/blocks/fixtures/FixturesSection";
import BottomTabNav from "@/components/ui/BottomTabNav";
import { setSportsPageQuery } from "@/store/features/slice/fixtures.slice";
import { router } from "expo-router";
import { setAzMenu } from "@/store/features/slice/app.slice";
import Footer from "@/components/layouts/Footer";

const top_bets = [
  { id: "todays-football", name: "TODAY'S FOOTBALL" },
  {
    id: "football-in-3-hours",
    name: "FOOTBALL IN 3 HOURS",
  },
];

export default function TabOneScreen() {
  const { data: sportsData, isLoading: sportsLoading } = useSportsMenuQuery({
    period: "all",
    start_date: "",
    end_date: "",
    timeoffset: "0",
  });
  useTopBetsQuery();
  const dispatch = useAppDispatch();
  const { top_bets: _top_bets } = useAppSelector((state) => state.fixtures);
  const [selectedSport, setSelectedSport] = useState<{
    sport_id: string;
    sport_name: string;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState<{
    id: string;
    name: string;
  }>({
    id: "matches",
    name: "Matches",
  });
  const {
    data: fixtures_data,
    isSuccess: is_success,
    isFetching,
    refetch,
  } = useFixturesHighlightsQuery({
    sport_id: String(
      selectedSport?.sport_id ? Number(selectedSport.sport_id ?? 1) : 1
    ),
  });
  const handleBetslipPress = () => {
    alert("Open Betslip page!");
  };
  // Animated pulse for loading cards
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    let loop: any;
    if (sportsLoading) {
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
  }, [sportsLoading, pulseAnim]);

  const sportsNav: {
    sport_id: string;
    name: string;
    total: number;
  }[] = (sportsData || []).map((sport) => ({
    sport_id: sport.sportID,
    name: sport.sportName,
    total: sport.total,
  }));
  // Ensure first sport is selected by default
  useEffect(() => {
    if (!selectedSport && sportsNav.length > 0) {
      setSelectedSport({
        sport_id: sportsNav[0].sport_id,
        sport_name: sportsNav[0].name,
      });
    }
  }, [selectedSport, sportsNav]);

  const topNav: {
    sport_id?: string;
    name: string;
    link?: string;
    total?: number;
    icon?: React.ReactNode;
  }[] = [...staticNav, ...sportsNav];
  const topBets: {
    id: string;
    name: string;
    sport_id?: string;
    tournament_id?: string;
  }[] = [
    ...top_bets,
    ..._top_bets.map((item) => ({
      id: item.tournamentName,
      name: item.tournamentName,
      sport_id: item.sportID,
      tournament_id: item.tournamentID,
    })),
  ];

  // Only BottomTabNav is the main scrollable content
  return (
    <View style={{ flex: 1, backgroundColor: "rgb(6,0,25)" }}>
      {/* Render sticky top bars outside the FlatList so they remain fixed */}
      <View style={styles.top_bar_wrapper}>
        {/* top_bar */}
        <View style={styles.top_bar}>
          <FlatList
            data={topNav}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (item.link) {
                    router.push(item.link as any);
                  }
                  if (item?.sport_id && item.name) {
                    dispatch(
                      setAzMenu({
                        sport_id: item.sport_id,
                        sport_name: item.name,
                      })
                    );
                    setTimeout(() => {
                      router.push(`/(tabs)/az-menu`);
                    }, 50);
                  }
                }}
                style={styles.top_bar_item}
                key={item.name}
              >
                {item.icon ??
                  categoryIconMap({
                    name: item.name,
                    color: "#fff",
                    font_size: 24,
                  })}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    color: "#B9B9BA",
                    fontSize: 12,
                    fontWeight: "600",
                    fontFamily: "PoppinsSemibold",
                  }}
                >
                  {item.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.name}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* filterBar */}
        <View style={styles.filterBarContainer}>
          <FlatList
            data={topBets}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (item.sport_id && item.tournament_id) {
                    dispatch(
                      setSportsPageQuery({
                        sport_id: Number(item.sport_id),
                        tournament_id: Number(item.tournament_id),
                      })
                    );
                    router.push(`/modal`);
                  }
                }}
                style={styles.filterBarItem}
                key={String(item.id)}
              >
                <Text style={styles.filterBarText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => String(item.id)}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={[{ key: "bottomtabnav" }]}
          renderItem={() => (
            <>
              <BottomTabNav
                sport_id={Number(
                  (selectedSport?.sport_id ?? sportsNav?.[0]?.sport_id) || 0
                )}
                isLoading={isFetching}
              />
              <Footer />
            </>
          )}
          ListHeaderComponent={() => (
            // If you still want the other header components (featured, fixturessection, sportsbar)
            // to appear above the BottomTabNav content, include them here as one View.
            <View style={styles.container}>
              {/*
                Keep the rest of the header components that are not sticky inside this single View.
                For example: Featured, FixturesSection, Sports bar, etc.
              */}
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  gap: 4,
                  backgroundColor: "rgb(6,0,25)",
                }}
              >
                <View style={{ padding: 6, backgroundColor: "rgb(6,0,25)" }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "600",
                      color: "#f1f1f1",
                    }}
                  >
                    Featured
                  </Text>
                </View>
                <View
                  style={{
                    width: 1,
                    height: "100%",
                    backgroundColor: "#4a4a4a",
                  }}
                />
                <FlatList
                  data={[
                    {
                      id: "matches",
                      name: "Matches",
                    },
                    {
                      id: "casino",
                      name: "Casino",
                    },
                    {
                      id: "codes",
                      name: "Codes",
                    },
                  ]}
                  horizontal
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedTab({
                          id: item.id,
                          name: item.name,
                        });
                      }}
                      key={item.name}
                      style={{
                        backgroundColor: "rgb(6,0,25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 4,
                        paddingVertical: 12,
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
                      {selectedTab?.id === item.id && (
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
              </View>
              {selectedTab?.id === "matches" ? (
                <FixturesSection />
              ) : selectedTab?.id === "casino" ? (
                <CasinoSection />
              ) : null}

              <View style={{ flex: 1, width: "100%" }}>
                <LiveSection />
              </View>
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
                    Sports
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
                  {sportsLoading ? (
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
                      data={sportsNav}
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
                              // fontWeight: "600",
                              letterSpacing: 0.6,
                              fontSize: 16,
                            }}
                          >
                            {item.name}
                          </Text>
                          {selectedSport?.sport_id === item.sport_id && (
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
            </View>
          )}
          // REMOVE stickyHeaderIndices to avoid scroll locking
          keyExtractor={(item) => item.key}
        />
      </View>

      <BetslipButton count={0} onPress={handleBetslipPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "rgb(6,0,25)",
  },
  top_bar_wrapper: {
    zIndex: 10,
    backgroundColor: "rgb(6,0,25)",
    // Optionally add shadow or elevation for sticky effect
  },
  horizontalSeparator: {
    width: 4,
    backgroundColor: "rgb(6,0,25)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
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
    height: 60,
    width: 80,
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
  filterBarContainer: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "rgb(6,0,25)",
    paddingVertical: 4,
    paddingHorizontal: 2,
    width: "100%",
  },
  filterBarItem: {
    backgroundColor: "#3c4771",
    marginRight: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderTopWidth: 3,
    borderTopColor: "rgb(217, 37, 1)",
  },
  filterBarText: {
    color: "#ffffff",
    fontFamily: "PoppinsSemibold",
    fontSize: 13,
  },
});
