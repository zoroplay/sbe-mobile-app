/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialFixturesState } from "../constants/fixtures.constants";
import type { FixturesState, PreMatchFixture } from "../types/fixtures.types";
import type {
  Market,
  OutcomeType,
  SelectedMarket,
} from "../../../data/types/betting.types";
import type { FindCouponData } from "../../services/data/betting.types";
import { TopBetsResponse } from "@/store/services/types/responses";
import { AppHelper } from "@/utils/helper";
// import {
//   Fixture,
//   OutcomeType,
//   Market,
//   SelectedMarket,
// } from "@/data/types/betting.types";
// import { FixturesState, PreMatchFixture } from "../types/fixtures.types";
// import { FindCouponData } from "@/store/services/data/betting.types";

const fixturesSlice = createSlice({
  name: "fixtures",
  initialState: initialFixturesState,
  reducers: {
    setFixtures: (
      state: FixturesState,
      action: PayloadAction<{
        fixtures: PreMatchFixture[];
        selectedMarket: SelectedMarket[];
        markets: Market[];
        outcomeTypes: OutcomeType[];
      }>
    ) => {
      state.fixtures = action.payload.fixtures;
      state.selectedMarket = action.payload.selectedMarket;
      state.markets = action.payload.markets;
      state.outcomeTypes = action.payload.outcomeTypes;
    },
    setSearchFixtures: (
      state: FixturesState,
      action: PayloadAction<{
        fixtures: PreMatchFixture[];
        selectedMarket: SelectedMarket[];
        markets: Market[];
      }>
    ) => {
      state.search.fixtures = action.payload.fixtures;
      state.search.selectedMarket = action.payload.selectedMarket;
      state.search.markets = action.payload.markets;
    },

    setSportsPageFixtures: (
      state: FixturesState,
      action: PayloadAction<{
        fixtures: PreMatchFixture[];
        selectedMarket: SelectedMarket[];
        markets: Market[];
      }>
    ) => {
      state.sports_page.fixtures = action.payload.fixtures;
      state.sports_page.selectedMarket = action.payload.selectedMarket;
      state.sports_page.markets = action.payload.markets;
    },
    setSportsPageQuery: (
      state: FixturesState,
      action: PayloadAction<{
        sport_id: number;
        tournament_id: number;
      }>
    ) => {
      state.sports_page.sport_id = action.payload.sport_id;
      state.sports_page.tournament_id = action.payload.tournament_id;
    },
    setSearchQuery: (state: FixturesState, action: PayloadAction<string>) => {
      state.search.search_query = action.payload ?? "";
    },
    setTopBets: (
      state: FixturesState,
      { payload }: PayloadAction<TopBetsResponse["data"]>
    ) => {
      state.top_bets = payload;
    },
    setSelectedGame: (
      state: FixturesState,
      action: PayloadAction<PreMatchFixture | null>
    ) => {
      state.selectedGame = action.payload;
    },
    clearSelectedGame: (state: FixturesState) => {
      state.selectedGame = null;
    },
    setCouponData: (
      state: FixturesState,
      action: PayloadAction<FindCouponData | null>
    ) => {
      state.couponData = action.payload;
    },
    clearCouponData: (state: FixturesState) => {
      state.couponData = null;
    },
    setCashDeskLoading: (state: FixturesState) => {
      state.cashdesk_fixtures.is_loading = true;
    },
    addCashDeskFixtures: (
      state: FixturesState,
      {
        payload,
      }: PayloadAction<{
        fixtures: PreMatchFixture[];
        selectedMarket: SelectedMarket[];
        sport_id: number;
      }>
    ) => {
      state.cashdesk_fixtures = {
        ...state.cashdesk_fixtures,
        fixtures: payload.fixtures,
        sport_id: payload.sport_id,
        selectedMarket: payload.selectedMarket,
        is_loading: false,
      };
    },
    removeCashDeskFixture: (
      state: FixturesState
      // action: PayloadAction<{
      //   index: number;
      // }>
    ) => {
      state.cashdesk_fixtures = {
        sport_id: 0,
        fixtures: [],
        selectedMarket: [],
        is_loading: false,
      };
    },
    setCasinoGame: (
      state: FixturesState,
      action: PayloadAction<{
        game_name: string;
        game_id: string;
      }>
    ) => {
      state.casino.game_name = action.payload.game_name;
      state.casino.game_id = action.payload.game_id;
    },

    updateFixtureOdds: (
      state: FixturesState,
      action: PayloadAction<{
        match_id: string;
        market_id: string;
        outcomes: any[];
      }>
    ) => {
      const { match_id, market_id, outcomes } = action.payload;

      // Update main fixtures immutably
      state.fixtures = state.fixtures.map((fixture) => {
        if (fixture.matchID !== match_id) return fixture;
        if (!fixture.outcomes) return fixture;
        // Only update if market exists
        if (
          state.markets &&
          state.markets.find((m) => m.marketID === market_id)
        ) {
          // Update outcomes and set trend
          const updatedOutcomes = fixture.outcomes.map((outcome) => {
            const updated = outcomes.find((n) => n.id === outcome.outcomeID);
            if (!updated) return outcome;
            const newTrend = AppHelper.getOutcomeTrend(
              outcome.odds,
              updated.odds
            );
            // If trend is increase or decrease, schedule reset to stable
            if (newTrend !== "stable") {
              setTimeout(() => {
                // Find the fixture and outcome again in the current state
                const fix = state.fixtures.find(
                  (f) => f.matchID === fixture.matchID
                );
                if (fix && fix.outcomes) {
                  const outc = fix.outcomes.find(
                    (o) => o.outcomeID === outcome.outcomeID
                  );
                  if (outc && outc.trend !== "stable") {
                    outc.trend = "stable";
                  }
                }
              }, 2000);
            }
            return {
              ...outcome,
              odds: updated.odds,
              active: updated.active,
              status: updated.status,
              trend: newTrend,
            };
          });
          return {
            ...fixture,
            outcomes: updatedOutcomes,
          };
        }
        return fixture;
      });

      // Update sports_page.fixtures immutably
      state.sports_page.fixtures = state.sports_page.fixtures.map((fixture) => {
        if (fixture.matchID !== match_id) return fixture;
        if (!fixture.outcomes) return fixture;
        if (
          state.sports_page.markets &&
          state.sports_page.markets.find((m) => m.marketID === market_id)
        ) {
          return {
            ...fixture,
            outcomes: fixture.outcomes.map((outcome) => {
              const updated = outcomes.find((n) => n.id === outcome.outcomeID);
              return updated
                ? {
                    ...outcome,
                    odds: updated.odds,
                    active: updated.active,
                    status: updated.status,
                  }
                : outcome;
            }),
          };
        }
        return fixture;
      });

      // Update cashdesk_fixtures.fixtures immutably
      if (state.cashdesk_fixtures && state.cashdesk_fixtures.fixtures) {
        state.cashdesk_fixtures.fixtures = state.cashdesk_fixtures.fixtures.map(
          (fixture) => {
            if (fixture.matchID !== match_id) return fixture;
            if (!fixture.outcomes) return fixture;
            return {
              ...fixture,
              outcomes: fixture.outcomes.map((outcome) => {
                const updated = outcomes.find(
                  (n) => n.id === outcome.outcomeID
                );
                return updated
                  ? {
                      ...outcome,
                      odds: updated.odds,
                      active: updated.active,
                      status: updated.status,
                    }
                  : outcome;
              }),
            };
          }
        );
      }
    },

    updateFixtureMarketStatus: (
      state: FixturesState,
      action: PayloadAction<{
        match_id: string;
        market_id: number;
        status: number;
      }>
    ) => {
      const { match_id, market_id, status } = action.payload;
      const fixture = state.fixtures.find((f) => f.matchID === match_id);
      if (fixture && state.markets) {
        const market = state.markets.find(
          (m) => m.marketID === market_id.toString()
        );
        if (market) {
          market.status = status;
        }
      }
    },

    updateFixtureOutcome: (
      state: FixturesState,
      action: PayloadAction<{
        matchID: string;
        outcomeID: string;
        updates: {
          odds?: number;
          status?: number;
          active?: boolean;
        };
      }>
    ) => {
      const { matchID, outcomeID, updates } = action.payload;
      const fixture = state.fixtures.find((f) => f.matchID === matchID);

      if (fixture) {
        const outcomeIndex = fixture.outcomes.findIndex(
          (outcome) => outcome.outcomeID === outcomeID
        );

        if (outcomeIndex >= 0) {
          fixture.outcomes.map((outcome) => {
            return {
              ...outcome,
              ...updates,
            };
          });
        }
      }
    },
  },
});

export const {
  setFixtures,
  setSelectedGame,
  clearSelectedGame,
  setCouponData,
  clearCouponData,
  updateFixtureOdds,
  updateFixtureMarketStatus,
  updateFixtureOutcome,
  addCashDeskFixtures,
  removeCashDeskFixture,
  setCashDeskLoading,
  setTopBets,
  setSportsPageFixtures,
  setSportsPageQuery,
  setSearchFixtures,
  setSearchQuery,
  setCasinoGame,
} = fixturesSlice.actions;
export default fixturesSlice.reducer;
