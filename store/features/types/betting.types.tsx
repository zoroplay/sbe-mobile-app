/* eslint-disable @typescript-eslint/no-explicit-any */
// import {  Outcome } from "@/data/types/betting.types";
import type { PreMatchFixture } from "./fixtures.types";
import type { LiveFixture } from "../slice/live-games.slice";
import type { Outcome } from "../../../data/types/betting.types";
import { BetSlip, FindBetData } from "@/store/services/data/betting.types";
import { BET_TYPES_ENUM } from "@/data/enums/enum";

export interface BettingGame {
  id: string;
  time: string;
  info: string;
  league: string;
  game: string;
  odds_1: number;
  odds_x: number;
  odds_2: number;
  more: string;
  is_live: boolean;
}

export interface SelectedBet {
  match_id: number;

  game_id: number;
  game: {
    matchID: number;
    event_type: "pre" | "live";
    gameID: number;
    match_id: number;
    game_id: number;
    name: string;
    eventTime: string;
    tournament: string;
    categoryName: string;
    sportName: string;
    sportID: number;
    // Additional fields from the game object
    away_team: string;
    category: string;
    combinability: number;
    display_name: string;
    element_id: string;
    event_date: string;
    event_name: string;
    fixed: boolean;
    home_team: string;
    market_id: number;
    market_name: string;
    market_status?: number;
    odds: string;
    outcome_id: string;
    outcome_name: string;
    event_id: string;
    producer_id: number;
    selection_id: string;
    specifier: string;
    sport: string;
    sport_id: string;
    stake: number;
    type: string;
  };
  // Legacy fields for backward compatibility
  odds_type: string;
  market_name: string;
  odds_value: number;
  // Odds change tracking
  previous_odds?: number;
  odds_change_direction?: "up" | "down" | "unchanged";
  last_updated?: number;
  display_until?: number;
  is_active: boolean;
}

// Odds change tracking for fixtures
export interface OddsChange {
  match_id: number;
  outcome_id: string;
  market_id: number;
  previous_odds: number;
  current_odds: number;
  change_direction: "up" | "down" | "unchanged";
  timestamp: number;
  display_until: number;
}

export interface BettingState {
  selected_bets: SelectedBet[];
  total_odds: number;
  potential_winnings: number;
  stake: number;
  is_loading: boolean;
  error: string | null;
  coupon_data: CouponData;
  // Odds tracking for fixtures
  odds_changes: Record<string, OddsChange>; // Key: `${match_id}_${outcome_id}`
  display_duration: number; // How long to show change indicators (in ms)
  betslip: BetSlip | null;
  bet_type: BET_TYPES_ENUM;
}

export interface CouponData {
  selections: any[];
  combos: any[];
  total_odds: number;
  max_bonus: number;
  min_bonus: number;
  max_win: number;
  min_win: number;
  stake: number;
  total_stake: number;
  min_odds: number;
  max_odds: number;
  event_type: string;
  channel: string;
  wth_tax: number;
  excise_duty: number;
  groupings: any[];
  bet_type: string;
  betslip_type: string;
  tournaments?: any;
  fixtures?: any;
  has_live?: boolean;
  min_stake?: number;
  min_gross_win?: number;
  min_wth?: number;
  gross_win?: number;
  total_combinations?: number;
}

export interface AddBetPayload {
  fixture_data: PreMatchFixture | LiveFixture;
  outcome_data: Outcome;
  element_id: string;
  bet_type?: string;
  global_vars?: any;
  bonus_list?: any[];
}

export interface RemoveBetPayload {
  event_id: number;
  display_name: string;
  global_vars?: any;
  bonus_list?: any[];
}
export interface RemoveGamePayload {
  event_id: number;
  outcome_id: string;
}

export interface UpdateStakePayload {
  stake: number;
  global_vars?: any;
  bonus_list?: any[];
}

export interface UpdateOddsPayload {
  match_id: number;
  outcome_id: string;
  new_odds: number;
  global_vars?: any;
  bonus_list?: any[];
}

export interface ToggleActiveSelectionPayload {
  event_id: number;
  display_name: string;
}

export interface UpdateComboStakePayload {
  combo_index: number;
  stake: number;
  global_vars?: any;
  bonus_list?: any[];
}

export interface UpdateBetTypePayload {
  bet_type: BET_TYPES_ENUM;
}

export interface ClearBetsPayload {
  // Empty payload for clearing all bets
}
