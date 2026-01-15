import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Market, Outcome } from "@/data/types/betting.types";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { useModal } from "@/hooks/useModal";
import OddsButton from "../buttons/OddsButton";
import { Entypo, SimpleLineIcons } from "@expo/vector-icons";
import { LiveFixture } from "@/store/features/slice/live-games.slice";
import LiveTimeDisplay from "../ui/LiveTiemDisplay";
import Button from "../buttons/Button";
import { Text } from "../Themed";
import { AppHelper } from "@/utils/helper";

interface FixturesBlockProps {
  markets: Market[];
  fixtures: (PreMatchFixture | LiveFixture)[];
  isLoading?: boolean;
}

const SkeletonLoader = () => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const SkeletonBox = ({
    width,
    height,
    style = {},
  }: {
    width: number | string;
    height: number;
    style?: any;
  }) => (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: "#2A2A2A",
          borderRadius: 4,
          opacity,
        },
        style,
      ]}
    />
  );

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          backgroundColor: "#181a20",
          borderBottomWidth: 1,
          borderBottomColor: "#232733",
          height: 48,
          paddingHorizontal: 12,
          gap: 12,
          alignItems: "center",
        }}
      >
        <SkeletonBox width={80} height={20} />
        <SkeletonBox width={100} height={20} />
        <SkeletonBox width={90} height={20} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {[1, 2].map((groupIdx) => (
          <View key={groupIdx} style={{ marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                borderBottomWidth: 1,
                borderBottomColor: "#2A2A2A",
                marginBottom: 8,
                backgroundColor: "#060019",
                paddingVertical: 8,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  width: "50%",
                }}
              >
                <SkeletonBox width={150} height={16} />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  width: "50%",
                  gap: 8,
                }}
              >
                <SkeletonBox width="30%" height={14} />
                <SkeletonBox width="30%" height={14} />
                <SkeletonBox width="30%" height={14} />
              </View>
            </View>

            {[1, 2, 3].map((fixtureIdx) => (
              <View
                key={fixtureIdx}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#2A2A2A",
                  paddingVertical: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <SkeletonBox width={60} height={12} />
                  <SkeletonBox width={80} height={12} />
                  <SkeletonBox width={120} height={12} />
                </View>

                {/* Teams and Odds */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <View style={{ width: "48%", gap: 6 }}>
                    <SkeletonBox width="90%" height={16} />
                    <SkeletonBox width="85%" height={16} />
                  </View>

                  <View
                    style={{
                      width: "48%",
                      flexDirection: "row",
                      gap: 4,
                    }}
                  >
                    <SkeletonBox
                      width="32%"
                      height={45}
                      style={{ borderRadius: 6 }}
                    />
                    <SkeletonBox
                      width="32%"
                      height={45}
                      style={{ borderRadius: 6 }}
                    />
                    <SkeletonBox
                      width="32%"
                      height={45}
                      style={{ borderRadius: 6 }}
                    />
                  </View>
                </View>

                <View style={{ marginTop: 6 }}>
                  <SkeletonBox width={40} height={12} />
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const FixturesBlock = ({
  markets: _markets,
  fixtures,
  isLoading = false,
}: FixturesBlockProps) => {
  const [selectedMarket, setSelectedMarket] = useState<{
    market_id: string;
    outcomes: Outcome[];
  }>({
    market_id: _markets.length > 0 ? _markets[0].marketID : "",
    outcomes: _markets.length > 0 ? _markets[0].outcomes : [],
  });

  const [showOUModal, setShowOUModal] = useState(false);
  const [currentFixtureId, setCurrentFixtureId] = useState<string | null>(null);
  const [fixtureSpecifiers, setFixtureSpecifiers] = useState<
    Record<string, Record<string, string>> // fixtureId -> marketId -> specifier
  >({});
  const { openModal } = useModal();

  // Process markets to prioritize 1x2 and Over/Under
  const markets = useMemo(() => {
    if (!_markets || _markets.length === 0) return [];

    const is1x2 = (m: any) => {
      const name = (m.marketName || "").replace(/[-\s]/g, "").toLowerCase();
      return name === "1x2" || name === "matchresult";
    };

    const isOverUnder = (m: any) => {
      const name = (m.marketName || "").replace(/[-\s]/g, "").toLowerCase();
      return name === "o/u" || name === "over/under";
    };

    const oneX2 = _markets.find(is1x2);
    const overUnderMarket = _markets.find(isOverUnder);

    let oneOverUnder;
    if (overUnderMarket) {
      const oneOverUnderOutcomes = overUnderMarket.outcomes.slice(0, 2);
      oneOverUnder = {
        ...overUnderMarket,
        outcomes: [
          { outcomeID: "-", outcomeName: "-", specifier: "-" } as any,
          ...oneOverUnderOutcomes,
        ],
      };
    }

    if (!oneX2 || !oneOverUnder) return _markets;

    const rest = _markets.filter(
      (m: any) => m !== oneX2 && m !== overUnderMarket
    );

    return [oneX2, oneOverUnder, ...rest];
  }, [_markets]);

  // Group over/under pairs by FIXTURE, MARKET ID and specifier
  const overUnderPairs = useMemo(() => {
    const isTotalsMarket = (outcome: any) => {
      const name = (
        outcome.marketName ||
        outcome.outcomeName ||
        outcome.displayName ||
        ""
      ).toLowerCase();
      return (
        name.includes("over/under") ||
        name.includes("o/u") ||
        name.includes("total") ||
        (outcome.specifier && /total=\d+(?:\.\d+)?/.test(outcome.specifier))
      );
    };

    // Get all unique specifiers across all fixtures FOR EACH MARKET
    const specifiersByMarket: Record<string, Set<string>> = {};
    const pairsByFixtureAndMarket: Record<
      string, // fixtureId
      Record<
        string, // marketId
        Record<
          string, // specifier
          { over?: any; under?: any; marketName?: string }
        >
      >
    > = {};

    (fixtures || []).forEach((fixture) => {
      const fixtureId = fixture.gameID;
      pairsByFixtureAndMarket[fixtureId] = {};

      (fixture.outcomes || []).forEach((outcome) => {
        if (!isTotalsMarket(outcome)) return;

        const marketId = String(outcome.marketID);
        const spec = outcome.specifier;

        if (!spec || !spec.match(/total=(\d+(?:\.\d+)?)/)) return;

        // Initialize market entry if not exists
        if (!pairsByFixtureAndMarket[fixtureId][marketId]) {
          pairsByFixtureAndMarket[fixtureId][marketId] = {};
        }

        // Track specifier for this market
        if (!specifiersByMarket[marketId]) {
          specifiersByMarket[marketId] = new Set<string>();
        }
        specifiersByMarket[marketId].add(spec);

        // Initialize specifier entry if not exists
        if (!pairsByFixtureAndMarket[fixtureId][marketId][spec]) {
          pairsByFixtureAndMarket[fixtureId][marketId][spec] = {
            marketName: outcome.marketName,
          };
        }

        // Identify over/under
        const name = (
          outcome.outcomeName ||
          outcome.displayName ||
          ""
        ).toLowerCase();

        if (name.includes("over")) {
          pairsByFixtureAndMarket[fixtureId][marketId][spec].over = outcome;
        } else if (name.includes("under")) {
          pairsByFixtureAndMarket[fixtureId][marketId][spec].under = outcome;
        }
      });
    });

    // Sort specifiers for each market
    const sortedSpecifiersByMarket: Record<string, string[]> = {};
    Object.keys(specifiersByMarket).forEach((marketId) => {
      sortedSpecifiersByMarket[marketId] = Array.from(
        specifiersByMarket[marketId] || []
      ).sort((a, b) => {
        const getVal = (spec: string) => {
          const m = spec.match(/total=(\d+(?:\.\d+)?)/);
          return m ? parseFloat(m[1]) : 0;
        };
        return getVal(a) - getVal(b);
      });
    });

    return {
      pairsByFixtureAndMarket,
      sortedSpecifiersByMarket,
    };
  }, [fixtures]);

  // Group fixtures by tournament
  const groupedFixtures = useMemo(() => {
    const groups: Record<
      string,
      { tournament: string; fixtures: (PreMatchFixture | LiveFixture)[] }
    > = {};
    (fixtures || []).forEach((fixture) => {
      const tournament = fixture.tournament || "Other";
      if (!groups[tournament]) {
        groups[tournament] = { tournament, fixtures: [] };
      }
      groups[tournament].fixtures.push(fixture);
    });
    return groups;
  }, [fixtures]);

  // Set default selected market
  useEffect(() => {
    if (markets.length === 0) return;

    const found = markets.find((m) => m.marketID === selectedMarket.market_id);
    if (!found) {
      setSelectedMarket({
        market_id: markets[0].marketID,
        outcomes: markets[0].outcomes,
      });
    }
  }, [markets, markets.length, selectedMarket.market_id, isLoading]);

  // Initialize default specifiers for all fixtures and markets
  useEffect(() => {
    if (fixtures && fixtures.length > 0) {
      setFixtureSpecifiers((prev) => {
        const newSpecifiers = { ...prev };

        fixtures.forEach((fixture) => {
          const fixtureId = fixture.gameID;
          if (!newSpecifiers[fixtureId]) {
            newSpecifiers[fixtureId] = {};
          }

          // Initialize default specifier for each totals market
          Object.keys(overUnderPairs.sortedSpecifiersByMarket).forEach(
            (marketId) => {
              const specifiers =
                overUnderPairs.sortedSpecifiersByMarket[marketId];
              if (specifiers && specifiers.length > 0) {
                const defaultSpec =
                  specifiers.find((s) => s.includes("total=1.5")) ||
                  specifiers[0];

                if (!newSpecifiers[fixtureId][marketId] && defaultSpec) {
                  newSpecifiers[fixtureId][marketId] = defaultSpec;
                }
              }
            }
          );
        });

        return newSpecifiers;
      });
    }
  }, [overUnderPairs.sortedSpecifiersByMarket, fixtures]);

  // Get specifiers for the current selected market
  const getCurrentMarketSpecifiers = useMemo(() => {
    if (!selectedMarket.market_id) return [];
    return (
      overUnderPairs.sortedSpecifiersByMarket[selectedMarket.market_id] || []
    );
  }, [selectedMarket.market_id, overUnderPairs.sortedSpecifiersByMarket]);

  // Check if selected market is a totals market (needs specifier grouping)
  const isTotalsMarketWithSpecifiers = useMemo(() => {
    if (!selectedMarket.market_id) return false;

    // Check if this market has specifiers in our data
    const specifiers =
      overUnderPairs.sortedSpecifiersByMarket[selectedMarket.market_id];
    return specifiers && specifiers.length > 0;
  }, [selectedMarket.market_id, overUnderPairs.sortedSpecifiersByMarket]);

  const handleSelectSpecifier = (spec: string) => {
    if (currentFixtureId && selectedMarket.market_id) {
      setFixtureSpecifiers((prev) => ({
        ...prev,
        [currentFixtureId]: {
          ...prev[currentFixtureId],
          [selectedMarket.market_id]: spec,
        },
      }));
    }
    setShowOUModal(false);
    setCurrentFixtureId(null);
  };

  const handleOpenOUModal = (fixtureId: string) => {
    setCurrentFixtureId(fixtureId);
    setShowOUModal(true);
  };

  const getFixtureSpecifier = (fixtureId: string, marketId: string): string => {
    return (
      fixtureSpecifiers[fixtureId]?.[marketId] ||
      overUnderPairs.sortedSpecifiersByMarket[marketId]?.[0] ||
      ""
    );
  };

  const currentModalSpecifier =
    currentFixtureId && selectedMarket.market_id
      ? getFixtureSpecifier(currentFixtureId, selectedMarket.market_id)
      : "";

  // Return skeleton if loading
  if (isLoading) {
    return <SkeletonLoader />;
  }

  // Show empty state if no fixtures
  if (!fixtures || fixtures.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <SimpleLineIcons
            name="exclamation"
            size={24}
            color="#ddd"
            style={{}}
          />
        </View>
        <Text
          style={{
            color: "#bfc9e0",
            fontSize: 16,
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          Sorry, there are no games currently available{`\n`}in this category.
          Please try later.{`\n`}Thank you.
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Over/Under Total Selection Modal */}
      <Modal
        visible={showOUModal}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => {
          setShowOUModal(false);
          setCurrentFixtureId(null);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
            alignItems: "stretch",
          }}
        >
          <View
            style={{
              backgroundColor: "#232733",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              paddingTop: 12,
              paddingHorizontal: 18,
              paddingBottom: 24,
              minHeight: 180,
              width: "100%",
              maxHeight: "70%",
              alignSelf: "flex-end",
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              <View
                style={{
                  width: 40,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: "#444",
                  marginBottom: 8,
                }}
              />
            </View>
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 18,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Select Total
            </Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {getCurrentMarketSpecifiers.map((spec) => {
                const val = spec.match(/total=(\d+(?:\.\d+)?)/)?.[1] || spec;
                const isSelected = currentModalSpecifier === spec;
                return (
                  <TouchableOpacity
                    key={spec}
                    onPress={() => handleSelectSpecifier(spec)}
                    style={{
                      backgroundColor: isSelected ? "#C72C3B" : "#181a20",
                      borderRadius: 6,
                      paddingVertical: 10,
                      paddingHorizontal: 18,
                      marginBottom: 8,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? "#fff" : "#333",
                    }}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#fff" : "#e0e0e0",
                        fontWeight: isSelected ? "bold" : "normal",
                        fontSize: 16,
                      }}
                    >
                      {val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              onPress={() => {
                setShowOUModal(false);
                setCurrentFixtureId(null);
              }}
              style={{
                marginTop: 16,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View>
        {/* Market Tabs */}
        {markets.length > 0 &&
          (markets.length > 4 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={{
                width: "100%",
                backgroundColor: "#181a20",
                borderBottomWidth: 1,
                borderBottomColor: "#232733",
                height: 44,
              }}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {markets.map((market, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() =>
                    setSelectedMarket({
                      market_id: market.marketID,
                      outcomes: market.outcomes,
                    })
                  }
                  style={{
                    minWidth: 90,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    backgroundColor: "#181a20",
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedMarket.market_id === market.marketID
                          ? "#fff"
                          : "#e0e0e0",
                      fontFamily: "PoppinsSemibold",
                      fontSize: 14,
                    }}
                  >
                    {market.marketName.trim()}
                  </Text>
                  {selectedMarket.market_id === market.marketID && (
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
            </ScrollView>
          ) : (
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                backgroundColor: "#181a20",
                borderBottomWidth: 1,
                borderBottomColor: "#232733",
                height: 44,
              }}
            >
              {markets.map((market: any, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() =>
                    setSelectedMarket({
                      market_id: market.marketID,
                      outcomes: market.outcomes,
                    })
                  }
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    backgroundColor: "#181a20",
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedMarket.market_id === market.marketID
                          ? "#fff"
                          : "#e0e0e0",
                      fontFamily: "PoppinsSemibold",
                      fontSize: 14,
                    }}
                  >
                    {market.marketName.trim()}
                  </Text>
                  {selectedMarket.market_id === market.marketID && (
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
          ))}

        {/* Fixtures List */}
        <ScrollView
          style={{ display: "flex", gap: 4 }}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {Object.values(groupedFixtures).map((group: any, index: number) => (
            <View key={index}>
              {/* Tournament Header */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  borderBottomWidth: 1,
                  borderBottomColor: "#2A2A2A",
                  marginBottom: 8,
                  backgroundColor: "#060019",
                }}
              >
                {/* Tournament Name */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    width: "50%",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: "PoppinsSemibold",
                      fontSize: 15,
                      marginVertical: 6,
                      marginBottom: 4,
                    }}
                  >
                    {group.tournament}
                  </Text>
                </View>

                {/* Outcome Labels */}
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    width: "50%",
                  }}
                >
                  {(() => {
                    const firstFixture = (fixtures || []).find((fixture) => {
                      const outcomes = (fixture.outcomes || []).filter(
                        (o) =>
                          String(o.marketID) ===
                          String(selectedMarket.market_id)
                      );
                      return outcomes.length > 0;
                    });

                    if (!firstFixture) return null;

                    const marketOutcomes = (firstFixture.outcomes || []).filter(
                      (o) =>
                        String(o.marketID) === String(selectedMarket.market_id)
                    );

                    if (
                      isTotalsMarketWithSpecifiers &&
                      marketOutcomes.length >= 2
                    ) {
                      return [
                        <View
                          key={"total"}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 4,
                            alignSelf: "flex-start",
                            width: "33%",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 14,
                              textAlign: "center",
                            }}
                          >
                            Total
                          </Text>
                        </View>,
                        <View
                          key={"over"}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 4,
                            alignSelf: "flex-start",
                            width: "33%",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 14,
                              textAlign: "center",
                            }}
                          >
                            Over
                          </Text>
                        </View>,
                        <View
                          key={"under"}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 4,
                            alignSelf: "flex-start",
                            width: "33%",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 14,
                              textAlign: "center",
                            }}
                          >
                            Under
                          </Text>
                        </View>,
                      ];
                    } else {
                      return marketOutcomes.slice(0, 3).map((outcome, idx) => (
                        <View
                          key={idx}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: 4,
                            alignSelf: "flex-start",
                            width: marketOutcomes.length === 3 ? "33%" : "50%",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "bold",
                              fontSize: 14,
                              textAlign: "center",
                            }}
                          >
                            {(outcome?.displayName ?? "").trim()}
                          </Text>
                        </View>
                      ));
                    }
                  })()}
                </View>
              </View>

              {/* Fixtures in Tournament */}
              {group.fixtures.map(
                (fixture: PreMatchFixture | LiveFixture, index: number) => {
                  const outcomesByMarket: Record<string, Outcome[]> = {};
                  (fixture.outcomes || []).forEach((outcome: any) => {
                    const mId = String(outcome.marketID);
                    if (!outcomesByMarket[mId]) outcomesByMarket[mId] = [];
                    outcomesByMarket[mId].push(outcome);
                  });

                  const marketOutcomes =
                    outcomesByMarket[String(selectedMarket.market_id)] || [];

                  return (
                    <View
                      key={index}
                      style={{
                        borderBottomWidth: 1,
                        borderBottomColor: "#2A2A2A",
                        paddingBlock: 4,
                      }}
                    >
                      {/* Fixture Info */}
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 4,
                        }}
                      >
                        {fixture.event_type === "live" ? (
                          <LiveTimeDisplay
                            eventTime={fixture.eventTime}
                            style={{
                              color: "#eee",
                              fontSize: 13,
                              marginBottom: 4,
                              fontWeight: "600",
                            }}
                            isLive={fixture.event_type === "live"}
                          />
                        ) : (
                          <Text
                            style={{
                              color: "#9ca0ab",
                              fontSize: 13,
                              marginBottom: 4,
                              fontWeight: "600",
                            }}
                          >
                            {AppHelper.formatDate(fixture.date)}
                          </Text>
                        )}
                        {fixture.event_type === "live" && (
                          <Text
                            style={{
                              color: "#eee",
                              fontSize: 13,
                              marginBottom: 4,
                              fontWeight: "600",
                            }}
                          >
                            {fixture.matchStatus}
                          </Text>
                        )}
                        <Text
                          style={{
                            color: "#9ca0ab",
                            fontSize: 13,
                            marginBottom: 4,
                            fontWeight: "600",
                          }}
                        >
                          ID {fixture.gameID}
                        </Text>
                        <Text
                          style={{
                            color: "#9ca0ab",
                            fontSize: 13,
                            marginBottom: 4,
                            fontWeight: "600",
                          }}
                        >
                          {fixture.tournament} - {fixture.categoryName}
                        </Text>
                      </View>

                      {/* Teams and Odds */}
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        {/* Team Names */}
                        <Pressable
                          onPress={() => {
                            openModal({
                              modal_name: MODAL_COMPONENTS.GAME_OPTIONS_MODAL,
                              ref: fixture.gameID,
                            });
                          }}
                          style={{
                            width:
                              fixture.event_type === "live" ? "38%" : "48%",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "500",
                              fontSize: 15,
                            }}
                          >
                            {fixture.homeTeam}
                          </Text>
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "600",
                              fontSize: 15,
                            }}
                          >
                            {fixture.awayTeam}
                          </Text>
                        </Pressable>
                        {fixture.event_type === "live" && (
                          <Pressable
                            onPress={() => {
                              openModal({
                                modal_name: MODAL_COMPONENTS.GAME_OPTIONS_MODAL,
                                ref: fixture.gameID,
                              });
                            }}
                            style={{ width: "8%" }}
                          >
                            <Text
                              style={{
                                color: "#fff",
                                fontWeight: "500",
                                fontSize: 15,
                              }}
                            >
                              {fixture.homeScore || "0"}
                            </Text>
                            <Text
                              style={{
                                color: "#fff",
                                fontWeight: "600",
                                fontSize: 15,
                              }}
                            >
                              {fixture.awayScore || "0"}
                            </Text>
                          </Pressable>
                        )}

                        {/* Odds Buttons */}
                        <View style={{ width: "48%" }}>
                          {isTotalsMarketWithSpecifiers &&
                          getCurrentMarketSpecifiers.length > 0 &&
                          overUnderPairs.pairsByFixtureAndMarket[
                            fixture.gameID
                          ]?.[selectedMarket.market_id] ? (
                            <View>
                              <View
                                style={{ flexDirection: "row", marginTop: 4 }}
                              >
                                <Button
                                  onPress={() =>
                                    handleOpenOUModal(fixture.gameID)
                                  }
                                  value={
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: 14,
                                          color: "#222",
                                        }}
                                      >
                                        {String(
                                          getFixtureSpecifier(
                                            fixture.gameID,
                                            selectedMarket.market_id
                                          )?.match(
                                            /total=(\d+(?:\.\d+)?)/
                                          )?.[1] ||
                                            getFixtureSpecifier(
                                              fixture.gameID,
                                              selectedMarket.market_id
                                            )
                                        )}
                                      </Text>
                                      <Entypo
                                        name="chevron-down"
                                        size={20}
                                        color="black"
                                      />
                                    </View>
                                  }
                                  rounded={{
                                    borderTopLeftRadius: 6,
                                    borderBottomLeftRadius: 6,
                                  }}
                                />
                                {(() => {
                                  const fixturePairs =
                                    overUnderPairs.pairsByFixtureAndMarket[
                                      fixture.gameID
                                    ] || {};
                                  const marketPairs =
                                    fixturePairs[selectedMarket.market_id] ||
                                    {};
                                  const currentSpec = getFixtureSpecifier(
                                    fixture.gameID,
                                    selectedMarket.market_id
                                  );
                                  const group = marketPairs[currentSpec] || {};

                                  return [
                                    <OddsButton
                                      key={`${group.over?.outcomeID || "over"}-${selectedMarket.market_id}`}
                                      outcome={group.over}
                                      game_id={
                                        fixture.gameID as unknown as number
                                      }
                                      fixture_data={fixture as PreMatchFixture}
                                      rounded={{}}
                                    />,
                                    <OddsButton
                                      key={`${group.under?.outcomeID || "under"}-${selectedMarket.market_id}`}
                                      outcome={group.under}
                                      game_id={
                                        fixture.gameID as unknown as number
                                      }
                                      fixture_data={fixture as PreMatchFixture}
                                      rounded={{
                                        borderTopRightRadius: 6,
                                        borderBottomRightRadius: 6,
                                      }}
                                    />,
                                  ];
                                })()}
                              </View>
                            </View>
                          ) : (
                            <View
                              style={{ flexDirection: "row", marginTop: 4 }}
                            >
                              {marketOutcomes
                                .slice(0, 3)
                                .map((outcome, idx) => (
                                  <OddsButton
                                    key={idx}
                                    outcome={outcome}
                                    game_id={
                                      fixture.gameID as unknown as number
                                    }
                                    fixture_data={fixture as PreMatchFixture}
                                    rounded={
                                      idx === 0
                                        ? {
                                            borderTopLeftRadius: 6,
                                            borderBottomLeftRadius: 6,
                                          }
                                        : idx === marketOutcomes.length - 1
                                          ? {
                                              borderTopRightRadius: 6,
                                              borderBottomRightRadius: 6,
                                            }
                                          : {}
                                    }
                                  />
                                ))}
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Active Markets Count */}
                      <View
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: "#9ca0ab",
                            fontSize: 13,
                            marginBottom: 4,
                            fontWeight: "600",
                          }}
                        >
                          +{fixture.activeMarkets || 0}
                        </Text>
                      </View>
                    </View>
                  );
                }
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default FixturesBlock;

const styles = StyleSheet.create({});
