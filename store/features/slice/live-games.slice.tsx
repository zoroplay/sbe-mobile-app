import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { Fixture, Market } from "../../../data/types/betting.types";
import { AppHelper } from "@/utils/helper";

export interface LiveFixture extends Fixture {
  event_type: "live";
}

export interface LiveGamesState {
  live_fixtures: LiveFixture[];
  markets: Market[];
  is_loading: boolean;
  error: string | null;
  last_updated: number | null;
}

const initialState: LiveGamesState = {
  live_fixtures: [],
  markets: [],
  is_loading: false,
  error: null,
  last_updated: null,
};

const LiveGamesSlice = createSlice({
  name: "liveGames",
  initialState,
  reducers: {
    setLiveFixtures: (
      state,
      action: PayloadAction<{ live_fixtures: LiveFixture[]; markets: Market[] }>
    ) => {
      state.live_fixtures = action.payload.live_fixtures;
      state.markets = action.payload.markets;
      state.last_updated = Date.now();
      state.error = null;
    },

    addLiveFixture: (state, action: PayloadAction<LiveFixture>) => {
      const existingIndex = state.live_fixtures.findIndex(
        (fixture) => fixture.matchID === action.payload.matchID
      );

      if (existingIndex >= 0) {
        state.live_fixtures[existingIndex] = action.payload;
      } else {
        state.live_fixtures.push(action.payload);
      }
      state.last_updated = Date.now();
    },

    updateLiveFixture: (
      state,
      action: PayloadAction<Partial<Fixture> & { matchID: string }>
    ) => {
      const { matchID, ...updates } = action.payload;
      const fixtureIndex = state.live_fixtures.findIndex(
        (fixture) => fixture.matchID === matchID
      );

      if (fixtureIndex >= 0) {
        state.live_fixtures[fixtureIndex] = {
          ...state.live_fixtures[fixtureIndex],
          ...updates,
        };
        state.last_updated = Date.now();
      }
    },

    updateLiveFixtureOutcome: (
      state,
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
      const fixtureIndex = state.live_fixtures.findIndex(
        (fixture) => fixture.matchID === matchID
      );

      if (fixtureIndex >= 0) {
        const outcomeIndex = state.live_fixtures[
          fixtureIndex
        ].outcomes.findIndex((outcome) => outcome.outcomeID === outcomeID);

        if (outcomeIndex >= 0) {
          // Update the outcome directly
          if (updates.odds !== undefined) {
            state.live_fixtures[fixtureIndex].outcomes[outcomeIndex].odds =
              updates.odds;
          }
          if (updates.status !== undefined) {
            state.live_fixtures[fixtureIndex].outcomes[outcomeIndex].status =
              updates.status;
          }
          if (updates.active !== undefined) {
            state.live_fixtures[fixtureIndex].outcomes[outcomeIndex].active =
              typeof updates.active === "boolean"
                ? updates.active
                  ? 1
                  : 0
                : updates.active;
          }

          state.last_updated = Date.now();
        }
      }
    },

    removeLiveFixture: (state, action: PayloadAction<string>) => {
      state.live_fixtures = state.live_fixtures.filter(
        (fixture) => fixture.matchID !== action.payload
      );
      state.last_updated = Date.now();
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.is_loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearLiveFixtures: (state) => {
      state.live_fixtures = [];
      state.last_updated = null;
      state.error = null;
    },

    // Increment time for all live fixtures
    incrementLiveTime: (state) => {
      const now = Date.now();

      state.live_fixtures.forEach((fixture) => {
        if (fixture.eventTime) {
          const cleanTime = AppHelper.extractCleanTime(fixture.eventTime);

          // Only increment if it's a valid live time format
          if (AppHelper.isValidLiveTime(cleanTime)) {
            const newTime = AppHelper.incrementTime(cleanTime, 1);
            fixture.eventTime = AppHelper.createLiveTimeString(newTime, true);
          }
        }
      });

      state.last_updated = now;
    },

    // Increment time for a specific fixture
    incrementFixtureTime: (
      state,
      action: PayloadAction<{
        matchID: string;
        incrementSeconds?: number;
      }>
    ) => {
      const { matchID, incrementSeconds = 1 } = action.payload;
      const now = Date.now();

      const fixtureIndex = state.live_fixtures.findIndex(
        (fixture) => fixture.matchID === matchID
      );

      if (fixtureIndex >= 0) {
        const fixture = state.live_fixtures[fixtureIndex];

        if (fixture.eventTime) {
          const cleanTime = AppHelper.extractCleanTime(fixture.eventTime);

          // Only increment if it's a valid live time format
          if (AppHelper.isValidLiveTime(cleanTime)) {
            const newTime = AppHelper.incrementTime(
              cleanTime,
              incrementSeconds
            );
            fixture.eventTime = AppHelper.createLiveTimeString(newTime, true);
          }
        }

        state.last_updated = now;
      }
    },
  },
});

export const {
  setLiveFixtures,
  addLiveFixture,
  updateLiveFixture,
  updateLiveFixtureOutcome,
  removeLiveFixture,
  setLoading,
  setError,
  clearLiveFixtures,
  incrementLiveTime,
  incrementFixtureTime,
} = LiveGamesSlice.actions;

// Selectors
export const selectLiveFixtures = (state: RootState) =>
  state.live_games?.live_fixtures;

export const selectLiveFixtureById = (state: RootState, matchID: string) =>
  state.live_games?.live_fixtures.find(
    (fixture) => fixture.matchID === matchID
  );

export const selectLiveGamesLoading = (state: RootState) =>
  state.live_games?.is_loading;

export const selectLiveGamesError = (state: RootState) =>
  state.live_games?.error;

export default LiveGamesSlice.reducer;
