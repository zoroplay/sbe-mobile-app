import { BET_TYPES_ENUM } from "@/data/enums/enum";
import { BettingState } from "../types/betting.types";

export const initialBettingState: BettingState = {
  selected_bets: [],
  total_odds: 1,
  potential_winnings: 0,
  stake: 0,
  is_loading: false,
  error: null,
  coupon_data: {
    selections: [],
    combos: [],
    total_odds: 0,
    max_bonus: 0,
    min_bonus: 0,
    max_win: 0,
    min_win: 0,
    stake: 0,
    total_stake: 0,
    min_odds: 0,
    max_odds: 0,
    event_type: "",
    channel: "",
    wth_tax: 0,
    excise_duty: 0,
    groupings: [],
    bet_type: "",
    betslip_type: "",
  },
  // Odds tracking
  odds_changes: {},
  display_duration: 3000,
  betslip: null,
  bet_type: BET_TYPES_ENUM.MULTIPLE,
  bet_data: null
};

export const BETTING_ACTIONS = {
  ADD_BET: "betting/addBet",
  REMOVE_BET: "betting/removeBet",
  UPDATE_STAKE: "betting/updateStake",
  CLEAR_BETS: "betting/clearBets",
  CALCULATE_ODDS: "betting/calculateOdds",
  SET_LOADING: "betting/setLoading",
  SET_ERROR: "betting/setError",
} as const;
