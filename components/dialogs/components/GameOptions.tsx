import React, { Fragment, useEffect, useMemo, useState } from "react";
import { View, ScrollView, Dimensions } from "react-native";

import { useGetFixtureQuery } from "@/store/services/bets.service";
import { useAppSelector } from "@/hooks/useAppDispatch";
import ExactGoals from "@/components/bets/section/ExactGoals";
import OverUnder from "@/components/bets/section/OverUnder";
import HandicapMarket from "@/components/bets/section/HandicapMarket";
import MainCard from "@/components/bets/section/MainCard";
import HalfTimeFullTimeScore from "@/components/bets/section/HalfTimeFullTimeScore";
import { MARKET_SECTION } from "@/data/enums/enum";
import CombinationCard from "@/components/bets/section/CombinationCard";
import BottomModal from "../modals/BottomModal";
import LiveTimeDisplay from "@/components/ui/LiveTiemDisplay";
import Input from "@/components/inputs/Input";
import { Text } from "@/components/Themed";
import FirstGoalScorer from "@/components/bets/section/FirstGoalScorer";

interface GameOptionsModalProps {
  onClose: () => void;
}
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const GameOptionsModal: React.FC<GameOptionsModalProps> = ({ onClose }) => {
  const { selectedGame } = useAppSelector((state) => state.fixtures);
  const { ref } = useAppSelector((state) => state.modal);
  const {
    data: fixturesData,
    isSuccess,
    isLoading: isFixtureLoading,
    error,
    refetch: refetchFixtures,
    isError,
  } = useGetFixtureQuery(
    {
      tournament_id: ref || "",
      sport_id: "1",
      period: "all",
      markets: ["1", "10", "18"],
      specifier: "",
    },
    { skip: !ref }
  );
  const DEFAULT_HEIGHT = SCREEN_HEIGHT * 0.9;

  // State for market search
  const [marketSearch, setMarketSearch] = useState("");

  useEffect(() => {
    if (ref) {
      refetchFixtures();
    }
  }, [ref]);

  // Group outcomes by marketId
  // Pattern-based market type detection (data-driven, not hardcoded IDs)
  const detectMarketType = (
    marketName: string,
    specifier: string,
    outcomes: any[]
  ): string => {
    // console.log("Detecting market type for market:", marketName);
    const name = (marketName ?? "").toLowerCase().trim();
    const spec = (specifier ?? "")?.toLowerCase().trim() || "";

    // Check for quarter-based 1X2 markets (e.g., "1st quarter - 1x2" with specifier "quarternr=1")
    // These should be grouped together and rendered as combination markets
    // Important: Only detect as QUARTER_1X2 if it's actually a 1X2 market, not over/under
    if (
      spec.includes("quarternr=") &&
      name.includes("quarter") &&
      name.includes("1x2")
    ) {
      return "QUARTER_1X2";
    }

    // 1X2 detection (always first)
    if (name === "1x2" || name.includes("match result")) {
      return "1X2";
    }

    // Double Chance detection (always second)
    if (name.includes("double chance") || name.includes("dc")) {
      return "DOUBLE_CHANCE";
    }

    // Draw No Bet detection
    if (name.includes("draw no bet") || name.includes("dnb")) {
      return "DNB";
    }

    // Home Total detection
    if (name.includes("home total") || name === "home total") {
      return "HOME_TOTAL";
    }

    // Away Total detection
    if (name.includes("away total") || name === "away total") {
      return "AWAY_TOTAL";
    }

    // Handicap detection (specifier like hcp=X:Y)
    if (
      name.includes("handicap") ||
      spec.includes("hcp=") ||
      outcomes.some((o) => o.outcomeName?.includes("("))
    ) {
      return "HANDICAP";
    }

    // Combination markets: look for 'and under', 'and over', '&&', 'or under', 'or over', '&', '+', 'gg/ng' in market name
    if (
      name.includes("and under") ||
      name.includes("and over") ||
      name.includes("&&") ||
      name.includes("or under") ||
      name.includes("or over") ||
      name.includes("&") ||
      name.includes("+") ||
      name.includes("gg/ng")
    ) {
      return "COMBINATION";
    }
    // Over/Under detection - general totals
    if (
      name.includes("over/under") ||
      name.includes("o/u") ||
      (name.includes("total") &&
        !name.includes("home") &&
        !name.includes("away")) ||
      spec.includes("total=") ||
      (outcomes.some((o) =>
        (o.outcomeName ?? "")?.toLowerCase().includes("over")
      ) &&
        outcomes.some((o) =>
          (o.outcomeName ?? "")?.toLowerCase().includes("under")
        ))
    ) {
      return "OVER_UNDER";
    }

    // Exact goals detection
    if (name.includes("exact") && name.includes("goal")) {
      return "EXACT_GOALS";
    }

    // Goalscorer markets
    if (name.includes("anytime goalscorer")) {
      return "ANYTIME_GOALSCORER";
    }
    if (name.includes("scorer") || name.includes("goal scorer")) {
      return "GOALSCORER";
    }

    // HT/FT Correct Score (numeric scores like "0:0/1:1", "1:0/2:1")
    if (
      (name.includes("ht/ft") && name.includes("c:s")) ||
      (name.includes("half") &&
        name.includes("full") &&
        name.includes("correct") &&
        name.includes("score"))
    ) {
      return "HT_FT_CORRECT_SCORE";
    }

    // HalfTime/FullTime outcome market (Home/Draw/Away combinations)
    if (
      name.includes("ht/ft") ||
      name.includes("half time/full time") ||
      name.includes("halftime/fulltime") ||
      (name.includes("half") &&
        name.includes("full") &&
        !name.includes("correct"))
    ) {
      return "HT_FT_OUTCOME";
    }

    // Default to simple card
    return "SIMPLE";
  };

  // Render market sections in the order received from the backend, with search filter
  const createDynamicMarketSections = () => {
    if (!selectedGame || !selectedGame.outcomes) {
      return [];
    }

    // Group outcomes by marketId, preserving order
    const marketIdOrder: number[] = [];
    const marketGroups: { [key: number]: any[] } = {};
    selectedGame.outcomes.forEach((outcome) => {
      const marketId = outcome.marketId;
      if (!marketGroups[marketId]) {
        marketGroups[marketId] = [];
        marketIdOrder.push(marketId);
      }
      marketGroups[marketId].push(outcome);
    });

    const componentProps = {
      fixture_data: selectedGame!,
      disabled: isFixtureLoading,
      is_loading: isFixtureLoading,
    };

    // Filter by market name if search is present
    const filteredMarketIdOrder =
      marketSearch.trim().length > 0
        ? marketIdOrder.filter((marketId) => {
            const outcomes = marketGroups[marketId];
            const marketName = outcomes[0]?.marketName || "";
            return marketName
              .toLowerCase()
              .includes(marketSearch.toLowerCase());
          })
        : marketIdOrder;

    // Render each market group in the order received
    return filteredMarketIdOrder.map((marketId) => {
      const outcomes = marketGroups[marketId];
      const marketName = outcomes[0]?.marketName || "";
      const specifier = outcomes[0]?.specifier || "";
      const marketType = detectMarketType(marketName, specifier, outcomes);

      // ...existing code for rendering components by marketType...
      if (
        marketType === "1X2" ||
        marketType === "DOUBLE_CHANCE" ||
        marketType === "DNB" ||
        marketType === "SIMPLE"
      ) {
        return {
          type: marketType,
          component: (
            <MainCard
              key={`${marketType}-${marketId}`}
              {...componentProps}
              market_id={marketId}
            />
          ),
        };
      } else if (marketType === "OVER_UNDER") {
        const isBasketball = Number(selectedGame?.sportID) === 2;
        return {
          type: marketType,
          component: isBasketball ? (
            <></>
          ) : (
            <OverUnder
              key={`${marketType}-${marketId}`}
              {...componentProps}
              market_id={marketId}
            />
          ),
        };
      } else if (marketType === "HANDICAP") {
        return {
          type: marketType,
          component: (
            <HandicapMarket
              key={`${marketType}-${marketId}`}
              {...componentProps}
              market_id={marketId}
            />
          ),
        };
      } else if (marketType === "HOME_TOTAL") {
        return {
          type: marketType,
          component: (
            <OverUnder
              key={`${marketType}-${marketId}`}
              {...componentProps}
              market_id={marketId}
              title="Home Total"
            />
          ),
        };
      } else if (marketType === "AWAY_TOTAL") {
        return {
          type: marketType,
          component: (
            <OverUnder
              key={`${marketType}-${marketId}`}
              {...componentProps}
              market_id={marketId}
              title="Away Total"
            />
          ),
        };
      } else if (
        marketType === "QUARTER_1X2" ||
        marketType === "COMBINATION" ||
        marketType === "HT_FT_OUTCOME"
      ) {
        return {
          type: marketType,
          component: (
            <>
              <CombinationCard
                key={`${marketType}-${marketId}`}
                {...componentProps}
                market_id={marketId}
              />
            </>
          ),
        };
      } else if (marketType === "EXACT_GOALS") {
        return {
          type: marketType,
          component: (
            <ExactGoals
              key={`${marketType}-${marketId}`}
              {...componentProps}
              market_id={marketId}
            />
          ),
        };
      } else if (marketType === "ANYTIME_GOALSCORER") {
        return {
          type: marketType,
          component: (
            <FirstGoalScorer
              key={`${marketType}-${marketId}`}
              {...componentProps}
              market_id={marketId}
            />
          ),
        };
      } else if (marketType === "HT_FT_CORRECT_SCORE") {
        return {
          type: marketType,
          component: (
            <HalfTimeFullTimeScore
              key={`${marketType}-${marketId}`}
              {...componentProps}
              market_id={marketId}
            />
          ),
        };
      }
      // Default fallback
      return {
        type: marketType,
        component: (
          <MainCard
            key={`default-${marketId}`}
            {...componentProps}
            market_id={marketId}
          />
        ),
      };
    });
  };

  // Create dynamic market sections - always render components, they handle their own loading states
  const dynamicMarketSections = useMemo(
    () => createDynamicMarketSections(),
    [selectedGame, isFixtureLoading, marketSearch]
  );

  // Only show dynamicMarketSections if we have outcomes, otherwise fallback to skeletons
  const hasOutcomes =
    selectedGame &&
    Array.isArray(selectedGame.outcomes) &&
    selectedGame.outcomes.length > 0;

  // Create skeleton components for loading state
  const skeletonSections = [
    {
      type: "1X2",
      component: (
        <MainCard
          key="skeleton-1x2"
          fixture_data={selectedGame!}
          disabled={true}
          is_loading={true}
          market_id={MARKET_SECTION.ONE_X_TWO}
        />
      ),
    },
    {
      type: "DOUBLE_CHANCE",
      component: (
        <MainCard
          key="skeleton-dc"
          fixture_data={selectedGame!}
          disabled={true}
          is_loading={true}
          market_id={MARKET_SECTION.DOUBLE_CHANCE}
        />
      ),
    },
    {
      type: "OVER_UNDER",
      component: (
        <OverUnder
          key="skeleton-ou"
          fixture_data={selectedGame!}
          disabled={true}
          is_loading={true}
          market_id={MARKET_SECTION.OVER_UNDER}
        />
      ),
    },
    {
      type: "COMBINATION",
      component: (
        <CombinationCard
          key="skeleton-combo"
          fixture_data={selectedGame!}
          disabled={true}
          is_loading={true}
          market_id={MARKET_SECTION.GOAL_NOGOAL}
        />
      ),
    },
    {
      type: "HANDICAP",
      component: (
        <HandicapMarket
          key="skeleton-handicap"
          fixture_data={selectedGame!}
          disabled={true}
          is_loading={true}
          market_id={MARKET_SECTION.FT_HANDICAP}
        />
      ),
    },
  ];

  const is_live =
    selectedGame?.eventTime !== "--:--" ||
    Number(selectedGame?.homeScore) > 0 ||
    Number(selectedGame?.awayScore) > 0;

  return (
    <BottomModal
      visible={true}
      onClose={() => {
        onClose();
      }}
      dismissible={true}
      height={DEFAULT_HEIGHT}
    >
      <View style={{ paddingInline: 10 }}>
        {/* Market search input */}
        {isFixtureLoading ? (
          <View
            style={{
              width: "70%",
              height: 24,
              backgroundColor: "#e5e7eb",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
        ) : is_live ? (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ color: "#888", marginBottom: 4 }}>
                {selectedGame?.tournament} • {selectedGame?.categoryName}
              </Text>
              <View style={{ marginBottom: 2 }}>
                <LiveTimeDisplay
                  style={{ color: "#1a1a1a" }}
                  eventTime={selectedGame?.eventTime!}
                  isLive
                />
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: "#232c5d",
                  fontSize: 14,
                  fontFamily: "PoppinsSemibold",
                }}
              >
                {selectedGame?.homeTeam ?? selectedGame?.competitor1}
              </Text>
              <View
                style={{
                  backgroundColor: "#d32f2f",
                  borderRadius: 3,
                  minWidth: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "PoppinsSemibold",
                    fontSize: 16,
                  }}
                >
                  {selectedGame?.homeScore ?? 0}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                // backgroundColor: "#f5f5f5",
              }}
            >
              <Text
                style={{
                  flex: 1,
                  color: "#232c5d",
                  fontFamily: "PoppinsSemibold",
                  fontSize: 14,
                  padding: 2,
                }}
              >
                {selectedGame?.awayTeam ?? selectedGame?.competitor2}
              </Text>
              <View
                style={{
                  backgroundColor: "#d32f2f",
                  borderRadius: 3,
                  minWidth: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "PoppinsSemibold",
                    fontSize: 16,
                  }}
                >
                  {selectedGame?.awayScore ?? 0}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: "PoppinsSemibold", fontSize: 16 }}>
                {selectedGame?.homeTeam ?? selectedGame?.competitor1} vs{" "}
                {selectedGame?.awayTeam ?? selectedGame?.competitor2}
              </Text>
            </View>
            <Text style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>
              {selectedGame?.tournament} • {selectedGame?.categoryName}
            </Text>
          </>
        )}
        <View style={{ marginTop: 4 }}>
          <Input
            placeholder="Search market name..."
            value={marketSearch}
            onChangeText={setMarketSearch}
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 6,
              // paddingHorizontal: 10,
              paddingVertical: 6,
              fontSize: 14,
              backgroundColor: "#fff",
            }}
            placeholderTextColor="#888"
          />
        </View>
      </View>
      {isFixtureLoading || !hasOutcomes ? (
        <ScrollView>
          {skeletonSections.map((section, index) => (
            <Fragment key={`skeleton-section-${index}`}>
              {section.component}
            </Fragment>
          ))}
        </ScrollView>
      ) : dynamicMarketSections.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <Text style={{ color: "#888", fontSize: 16, textAlign: "center" }}>
            No markets found matching your search.
          </Text>
        </View>
      ) : (
        <ScrollView>
          {dynamicMarketSections.map((section, index) => {
            // Extract marketId from the component's key prop
            const componentKey = section.component?.key || `market-${index}`;
            return (
              <Fragment key={`section-${componentKey}`}>
                {section.component}
              </Fragment>
            );
          })}
        </ScrollView>
      )}
    </BottomModal>
  );
};

export default GameOptionsModal;
