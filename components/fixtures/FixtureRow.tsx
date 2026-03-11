import React, { useCallback, useMemo } from "react";
import { View, Pressable } from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Market, Outcome } from "@/data/types/betting.types";
import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import { MODAL_COMPONENTS } from "@/store/features/types";
import { useModal } from "@/hooks/useModal";
import OddsButton from "@/components/buttons/OddsButton";
import Button from "@/components/buttons/Button";
import { Text } from "@/components/Themed";
import { AppHelper } from "@/utils/helper";
import { LiveFixture } from "@/store/features/slice/live-games.slice";
import LiveTimeDisplay from "@/components/ui/LiveTiemDisplay";
import { useFixtureMqtt } from "@/hooks/useFixtureMqtt";

export interface FixtureRowProps {
  fixture: PreMatchFixture | LiveFixture;
  selectedMarket: { market_id: string; outcomes: Outcome[] };
  markets: Market[];
  isTotalsMarketWithSpecifiers: boolean;
  getCurrentMarketSpecifiers: string[];
  overUnderPairs: {
    pairsByFixtureAndMarket: Record<
      string,
      Record<
        string,
        Record<string, { over?: any; under?: any; marketName?: string }>
      >
    >;
    sortedSpecifiersByMarket: Record<string, string[]>;
  };
  getFixtureSpecifier: (fixtureId: string, marketId: string) => string;
  handleOpenOUModal: (fixtureId: string) => void;
}

/**
 * A single fixture row with its own per-fixture MQTT subscription.
 *
 * - Subscribes to odds_change for this match → odds update in-place on the
 *   OddsButton via local `oddsOverrides` state (no Redux dispatch needed).
 * - Subscribes to bet_stop for this match → returns null so the row removes
 *   itself from the list without any parent re-render.
 */
const FixtureRow = React.memo(
  ({
    fixture,
    selectedMarket,
    markets,
    isTotalsMarketWithSpecifiers,
    getCurrentMarketSpecifiers,
    overUnderPairs,
    getFixtureSpecifier,
    handleOpenOUModal,
  }: FixtureRowProps) => {
    const { openModal } = useModal();
    const { oddsOverrides, isStopped } = useFixtureMqtt(fixture.matchID);

    // Merge a live MQTT override into an outcome object (non-mutating)
    const applyOverride = useCallback(
      (outcome: any) => {
        if (!outcome) return outcome;
        const override = oddsOverrides[outcome.outcomeID];
        return override ? { ...outcome, ...override } : outcome;
      },
      [oddsOverrides],
    );

    // Build marketId → Outcome[] map with live odds already applied
    const outcomesByMarket = useMemo(() => {
      const map: Record<string, Outcome[]> = {};
      (fixture.outcomes || []).forEach((outcome: any) => {
        const mId = String(outcome.marketID);
        if (!map[mId]) map[mId] = [];
        map[mId].push(applyOverride(outcome));
      });
      return map;
    }, [fixture.outcomes, applyOverride]);

    // Bet-stop received → remove this row from the list
    if (isStopped) return null;

    let marketOutcomes =
      outcomesByMarket[String(selectedMarket.market_id)] || [];

    // Sort Double Chance outcomes: 1X → 12 → X2
    const selectedMarketObj = markets.find(
      (m) => m.marketID === selectedMarket.market_id,
    );
    if (
      selectedMarketObj &&
      (selectedMarketObj.marketName?.toLowerCase().includes("double chance") ||
        selectedMarketObj.marketID === "10")
    ) {
      const order = ["1X", "12", "X2"];
      marketOutcomes = [...marketOutcomes].sort((a, b) => {
        const aName = (a.displayName || "").toUpperCase();
        const bName = (b.displayName || "").toUpperCase();
        return order.indexOf(aName) - order.indexOf(bName);
      });
    }

    return (
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#2A2A2A",
          paddingBlock: 2,
        }}
      >
        {/* Fixture Info */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
          }}
        >
          {fixture.event_type === "live" ? (
            <LiveTimeDisplay
              eventTime={fixture.eventTime}
              style={{
                color: "#eee",
                fontSize: 11.5,
                marginBottom: 2,
                fontWeight: "600",
              }}
              isLive={fixture.event_type === "live"}
            />
          ) : (
            <Text
              style={{
                color: "#9ca0ab",
                fontSize: 11.5,
                marginBottom: 2,
                fontWeight: "600",
              }}
            >
              {AppHelper.formatDate(fixture.eventTime)}
            </Text>
          )}
          {fixture.event_type === "live" && (
            <Text
              style={{
                color: "#eee",
                fontSize: 11.5,
                marginBottom: 2,
                fontWeight: "600",
              }}
            >
              {fixture.matchStatus}
            </Text>
          )}
          <Text
            style={{
              color: "#9ca0ab",
              fontSize: 11.5,
              marginBottom: 2,
              fontWeight: "600",
            }}
          >
            {fixture.categoryName}
          </Text>
        </View>

        {/* Teams and Odds */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          }}
        >
          {/* Team Names */}
          <Pressable
            onPress={() =>
              openModal({
                modal_name: MODAL_COMPONENTS.GAME_OPTIONS_MODAL,
                ref: fixture.gameID,
              })
            }
            style={{
              width: fixture.event_type === "live" ? "38%" : "48%",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "500", fontSize: 12.5 }}>
              {fixture.homeTeam}
            </Text>
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12.5 }}>
              {fixture.awayTeam}
            </Text>
          </Pressable>

          {fixture.event_type === "live" && (
            <Pressable
              onPress={() =>
                openModal({
                  modal_name: MODAL_COMPONENTS.GAME_OPTIONS_MODAL,
                  ref: fixture.gameID,
                })
              }
              style={{ width: "8%" }}
            >
              <Text
                style={{ color: "#fff", fontWeight: "500", fontSize: 12.5 }}
              >
                {fixture.homeScore || "0"}
              </Text>
              <Text
                style={{ color: "#fff", fontWeight: "600", fontSize: 12.5 }}
              >
                {fixture.awayScore || "0"}
              </Text>
            </Pressable>
          )}

          {/* Odds Buttons */}
          <View style={{ width: "48%" }}>
            {isTotalsMarketWithSpecifiers &&
            getCurrentMarketSpecifiers.length > 0 &&
            overUnderPairs.pairsByFixtureAndMarket[fixture.gameID]?.[
              selectedMarket.market_id
            ] ? (
              <View style={{ flexDirection: "row", marginTop: 4 }}>
                <Button
                  onPress={() => handleOpenOUModal(fixture.gameID)}
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
                          fontSize: 12.5,
                          color: "#222",
                        }}
                      >
                        {String(
                          getFixtureSpecifier(
                            fixture.gameID,
                            selectedMarket.market_id,
                          )?.match(/total=(\d+(?:\.\d+)?)/)?.[1] ||
                            getFixtureSpecifier(
                              fixture.gameID,
                              selectedMarket.market_id,
                            ),
                        )}
                      </Text>
                      <Entypo name="chevron-down" size={18} color="black" />
                    </View>
                  }
                  rounded={{
                    borderTopLeftRadius: 6,
                    borderBottomLeftRadius: 6,
                  }}
                />
                {(() => {
                  const fixturePairs =
                    overUnderPairs.pairsByFixtureAndMarket[fixture.gameID] ||
                    {};
                  const marketPairs =
                    fixturePairs[selectedMarket.market_id] || {};
                  const currentSpec = getFixtureSpecifier(
                    fixture.gameID,
                    selectedMarket.market_id,
                  );
                  const group = marketPairs[currentSpec] || {};

                  return [
                    <OddsButton
                      key={`${group.over?.outcomeID || "over"}-${selectedMarket.market_id}`}
                      outcome={applyOverride(group.over)}
                      game_id={fixture.gameID as unknown as number}
                      fixture_data={fixture as PreMatchFixture}
                      rounded={{}}
                    />,
                    <OddsButton
                      key={`${group.under?.outcomeID || "under"}-${selectedMarket.market_id}`}
                      outcome={applyOverride(group.under)}
                      game_id={fixture.gameID as unknown as number}
                      fixture_data={fixture as PreMatchFixture}
                      rounded={{
                        borderTopRightRadius: 6,
                        borderBottomRightRadius: 6,
                      }}
                    />,
                  ];
                })()}
              </View>
            ) : (
              <View style={{ flexDirection: "row", marginTop: 4 }}>
                {(() => {
                  const count = 3;
                  const oddsButtons = [];
                  for (let idx = 0; idx < count; idx++) {
                    const outcome = marketOutcomes[idx];
                    oddsButtons.push(
                      <OddsButton
                        key={idx}
                        outcome={outcome}
                        game_id={fixture.gameID as unknown as number}
                        fixture_data={fixture as PreMatchFixture}
                        rounded={
                          idx === 0
                            ? {
                                borderTopLeftRadius: 6,
                                borderBottomLeftRadius: 6,
                              }
                            : idx === count - 1
                              ? {
                                  borderTopRightRadius: 6,
                                  borderBottomRightRadius: 6,
                                }
                              : {}
                        }
                      />,
                    );
                  }
                  return oddsButtons;
                })()}
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
              fontSize: 11,
              marginBottom: 4,
              fontWeight: "600",
            }}
          >
            +{fixture.activeMarkets || 0}
          </Text>
        </View>
      </View>
    );
  },
);

export default FixtureRow;
