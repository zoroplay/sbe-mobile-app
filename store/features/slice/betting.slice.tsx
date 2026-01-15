/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialBettingState } from "../constants/betting.constants";
import type {
  BettingState,
  AddBetPayload,
  RemoveBetPayload,
  UpdateStakePayload,
  SelectedBet,
  ToggleActiveSelectionPayload,
  UpdateComboStakePayload,
  UpdateBetTypePayload,
} from "../types/betting.types";
import type {
  BetSlip,
  FindBetData,
  LiveOutcome,
} from "../../services/data/betting.types";
import { BET_TYPES_ENUM } from "@/data/enums/enum";
import { AppHelper } from "@/utils/helper";

const calculateTotalOdds = (bets: any[]): number => {
  if (bets.length === 0) return 1;
  return bets.reduce(
    (total, bet) => total * AppHelper.safeNumber(bet.odds_value),
    1
  );
};

const calculatePotentialWinnings = (
  total_odds: number,
  stake: number
): number => {
  return AppHelper.safeNumber(total_odds) * AppHelper.safeNumber(stake);
};

const calculateWinnings = (
  coupon_data: any,
  global_vars: any,
  bonus_list: any[]
) => {
  const stake = coupon_data.stake || 0;
  const total_odds = parseFloat(coupon_data.total_odds.toString());
  const gross_win = total_odds * stake;
  const bonus = calculateBonus(coupon_data, global_vars, bonus_list);
  const wth_tax = ((gross_win - stake) * (global_vars.wth_perc || 5)) / 100;
  const max_win = gross_win - wth_tax;

  return {
    max_win,
    max_bonus: bonus,
    gross_win,
    wth_tax,
  };
};

const calculateBonus = (
  coupon_data: any,
  global_vars: any,
  bonus_list: any[]
) => {
  if (!bonus_list || bonus_list.length === 0) return 0;

  const valid_events = coupon_data.selections.filter(
    (sel: any) => parseFloat(sel.odds) >= (global_vars.min_bonus_odd || 1.5)
  ).length;

  const bonus = bonus_list.find((b: any) => b.ticket_length === valid_events);
  if (!bonus) return 0;

  const gross_win =
    parseFloat(coupon_data.total_odds.toString()) * (coupon_data.stake || 0);
  return (gross_win * bonus.bonus) / 100;
};

const groupTournament = (selections: any[]) => {
  const tournaments: any = {};
  selections.forEach((sel: any) => {
    if (!tournaments[sel.tournament]) {
      tournaments[sel.tournament] = [];
    }
    tournaments[sel.tournament].push(sel);
  });
  return tournaments;
};

const groupSelections = (selections: any[]) => {
  const fixtures: any = {};
  selections.forEach((sel: any) => {
    if (!fixtures[sel.match_id]) {
      fixtures[sel.match_id] = [];
    }
    fixtures[sel.match_id].push(sel);
  });
  return fixtures;
};

const getSplitProps = (coupon_data: any) => {
  const selections = coupon_data.selections;
  const min_odds = Math.min(
    ...selections.map((sel: any) => parseFloat(sel.odds))
  );
  const max_odds = Math.max(
    ...selections.map((sel: any) => parseFloat(sel.odds))
  );
  const stake = coupon_data.stake || 0;
  const no_of_combos = selections.length;
  const min_stake = stake / no_of_combos;
  const min_bonus = 0; // Calculate based on bonus logic
  const max_bonus = 0; // Calculate based on bonus logic

  return {
    min_odds,
    max_odds,
    stake,
    no_of_combos,
    min_stake,
    min_bonus,
    max_bonus,
  };
};

const calcCombinations = (coupon_data: any) => {
  const selections = coupon_data.selections;
  const max_combinations = Math.min(1000, 1000); // Set reasonable limits
  const groups: any[] = [];

  // Calculate combinations for different groupings
  for (let k = 1; k <= selections.length; k++) {
    const combinations = calculateCombinationCount(selections.length, k);
    if (combinations <= max_combinations) {
      groups.push({
        grouping: k,
        combinations,
        stake_per_combination: 0,
        min_odds: 0,
        max_odds: 0,
        min_win: 0,
        max_win: 0,
        min_bonus: 0,
        max_bonus: 0,
      });
    }
  }

  return { groups };
};

const calculateCombinationCount = (n: number, k: number): number => {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 1; i <= k; i++) {
    result = (result * (n - i + 1)) / i;
  }
  return Math.floor(result);
};

const updateComboWinningsFromTotal = (
  coupon_data: any,
  global_vars: any,
  bonus_list: any[]
) => {
  // Update combo winnings based on total stake and groupings
  const groupings = coupon_data.groupings || [];
  let total_combinations = 0;
  let min_win = 0;
  let max_win = 0;

  groupings.forEach((group: any) => {
    if (group.combinations > 0) {
      total_combinations += group.combinations;
      const stake_per_combo = (coupon_data.stake || 0) / total_combinations;

      // Calculate min/max winnings for this grouping
      const group_min_odds = calculateMinOddsForGrouping(
        coupon_data.selections,
        group.grouping
      );
      const group_max_odds = calculateMaxOddsForGrouping(
        coupon_data.selections,
        group.grouping
      );

      const group_min_win = group_min_odds * stake_per_combo;
      const group_max_win = group_max_odds * stake_per_combo;

      min_win += group_min_win;
      max_win += group_max_win;
    }
  });

  coupon_data.total_combinations = total_combinations;
  coupon_data.min_win = min_win;
  coupon_data.max_win = max_win;
  coupon_data.min_bonus = calculateBonus(coupon_data, global_vars, bonus_list);
  coupon_data.max_bonus = calculateBonus(coupon_data, global_vars, bonus_list);

  return coupon_data;
};

const calculateMinOddsForGrouping = (
  selections: any[],
  grouping: number
): number => {
  // Calculate minimum odds for a specific grouping
  const sorted_odds = selections
    .map((sel: any) => parseFloat(sel.odds))
    .sort((a, b) => a - b);
  const min_odds_selection = sorted_odds.slice(0, grouping);
  return min_odds_selection.reduce((total, odds) => total * odds, 1);
};

const calculateMaxOddsForGrouping = (
  selections: any[],
  grouping: number
): number => {
  // Calculate maximum odds for a specific grouping
  const sorted_odds = selections
    .map((sel: any) => parseFloat(sel.odds))
    .sort((a, b) => b - a);
  const max_odds_selection = sorted_odds.slice(0, grouping);
  return max_odds_selection.reduce((total, odds) => total * odds, 1);
};

const BettingSlice = createSlice({
  name: "betting",
  initialState: initialBettingState,
  reducers: {
    addBet: (state: BettingState, action: PayloadAction<AddBetPayload>) => {
      const {
        fixture_data,
        outcome_data,
        element_id,
        bet_type = "pre",
        global_vars = {},
        bonus_list = [],
      } = action.payload;
      // console.log("fixture_data ======", fixture_data);
      console.log("outcome_data ++++++++++", outcome_data);

      const odds = outcome_data?.odds ?? "-";

      if (String(odds) === "-" || odds === null || odds === 0) {
        return; // Invalid odds, don't add
      }
      // Create selection data (similar to frapapa-shop)
      const selection_data = {
        match_id: parseInt(fixture_data.matchID?.toString() || "0"),
        event_id: parseInt(fixture_data.gameID?.toString() || "0"),
        game_id: fixture_data.gameID
          ? parseInt(fixture_data.gameID?.toString() || "0")
          : parseInt(fixture_data.gameID?.toString() || "0"),
        event_name: fixture_data.name,
        market_id: outcome_data.marketID ?? outcome_data.marketId,
        market_name: outcome_data.marketName,
        specifier: outcome_data.specifier,
        outcome_name: outcome_data.outcomeName,
        display_name: outcome_data.displayName,
        outcome_id: outcome_data.outcomeID,
        odds: parseFloat(outcome_data.odds.toString()).toFixed(2),
        event_date: fixture_data.date,
        tournament: fixture_data.tournament,
        category: fixture_data.categoryName,
        sport: fixture_data.sportName,
        sport_id: fixture_data.sportID,
        type: fixture_data.event_type,
        event_type: fixture_data.event_type,
        fixed: false,
        combinability: 0,
        selection_id: element_id,
        element_id: element_id,
        home_team: fixture_data.homeTeam,
        away_team: fixture_data.awayTeam,
        producer_id: outcome_data.producerID,
        stake: 0,
        matchStatus: fixture_data.matchStatus,
        market_status: outcome_data.status,
      };

      // if (bet_type === "live") {
      //   selection_data.in_play_time = fixture_data.live_data?.match_time;
      //   selection_data.score = fixture_data.score;
      // }

      // Initialize coupon if empty
      if (!state.coupon_data.selections.length) {
        state.coupon_data = {
          selections: [],
          combos: [],
          total_odds: 1,
          max_bonus: 0,
          min_bonus: 0,
          max_win: 0,
          min_win: 0,
          stake: 0,
          total_stake: 0,
          min_odds: 1,
          max_odds: 1,
          event_type: "prematch",
          channel: "website",
          wth_tax: 0,
          excise_duty: 0,
          groupings: [],
          bet_type: "Single",
          betslip_type: "Single",
        };
      }

      // Check if this is the first selection
      if (!state.coupon_data.selections.length) {
        state.coupon_data.bet_type = "Single";
        state.coupon_data.selections.push(selection_data);
        state.coupon_data.total_odds = Number(
          (
            parseFloat(state.coupon_data.total_odds.toString()) *
            parseFloat(selection_data.odds)
          ).toFixed(2)
        );

        // Calculate winnings with bonus
        const winnings = calculateWinnings(
          state.coupon_data,
          global_vars,
          bonus_list
        );
        state.coupon_data.max_win = winnings.max_win;
        state.coupon_data.max_bonus = winnings.max_bonus;
        state.coupon_data.gross_win = winnings.gross_win;
        state.coupon_data.wth_tax = winnings.wth_tax;
        state.coupon_data.tournaments = groupTournament(
          state.coupon_data.selections
        );
        state.coupon_data.fixtures = groupSelections(
          state.coupon_data.selections
        );

        if (bet_type === "live") state.coupon_data.has_live = true;
      } else {
        // Check if selection is from same match (Split bet)
        const same_match_selection = state.coupon_data.selections.find(
          (sel: any) => sel.match_id === selection_data.match_id
        );

        if (same_match_selection) {
          // Remove old selection from same match and add new one
          state.coupon_data.selections = state.coupon_data.selections.filter(
            (sel: any) => sel.match_id !== selection_data.match_id
          );

          // Add the new selection
          state.coupon_data.selections.push(selection_data);

          // Recalculate total odds
          state.coupon_data.total_odds = Number(
            state.coupon_data.selections
              .reduce(
                (total: number, sel: any) => total * parseFloat(sel.odds),
                1
              )
              .toFixed(2)
          );

          // Update groupings
          state.coupon_data.tournaments = groupTournament(
            state.coupon_data.selections
          );
          state.coupon_data.fixtures = groupSelections(
            state.coupon_data.selections
          );

          if (bet_type === "live") state.coupon_data.has_live = true;

          // Handle different bet types based on remaining selections
          if (state.coupon_data.selections.length === 1) {
            state.coupon_data.bet_type = "Single";
            const winnings = calculateWinnings(
              state.coupon_data,
              global_vars,
              bonus_list
            );
            state.coupon_data.max_win = winnings.max_win;
            state.coupon_data.max_bonus = winnings.max_bonus;
            state.coupon_data.gross_win = winnings.gross_win;
            state.coupon_data.wth_tax = winnings.wth_tax;
          } else {
            // Calculate combinations for Multiple bets
            const calculated_group = calcCombinations(state.coupon_data);
            state.coupon_data.combos = calculated_group.groups;

            if (state.coupon_data.bet_type === "Combo") {
              if (
                state.coupon_data.groupings &&
                state.coupon_data.groupings.length
              ) {
                // Update combo winnings from total
                const updated_coupon = updateComboWinningsFromTotal(
                  state.coupon_data,
                  global_vars,
                  bonus_list
                );
                Object.assign(state.coupon_data, updated_coupon);
              }
            } else {
              state.coupon_data.betslip_type = "Multiple";
              state.coupon_data.bet_type = "Multiple";
              const winnings = calculateWinnings(
                state.coupon_data,
                global_vars,
                bonus_list
              );
              state.coupon_data.max_win = winnings.max_win;
              state.coupon_data.max_bonus = winnings.max_bonus;
              state.coupon_data.wth_tax = winnings.wth_tax;
              state.coupon_data.gross_win = winnings.gross_win;
            }
          }

          /* COMMENTED OUT SPLIT BET FUNCTIONALITY FOR FUTURE REFERENCE
          // Add selection to selections list
          state.coupon_data.selections.push(selection_data);
          state.coupon_data.tournaments = groupTournament(
            state.coupon_data.selections
          );
          state.coupon_data.fixtures = groupSelections(
            state.coupon_data.selections
          );
          state.coupon_data.bet_type = "Split";
          state.coupon_data.betslip_type = "Combo";

          const split_props = getSplitProps(state.coupon_data);

          // Calculate winnings
          const min_winnings = split_props.min_odds * split_props.min_stake;
          const max_winnings = split_props.max_odds * split_props.min_stake;

          // Calculate bonus
          state.coupon_data.min_bonus = calculateBonus(
            state.coupon_data,
            global_vars,
            bonus_list
          );
          state.coupon_data.min_gross_win =
            split_props.min_bonus + min_winnings;
          state.coupon_data.min_wth =
            ((state.coupon_data.min_gross_win - state.coupon_data.stake) *
              (global_vars.wth_perc || 5)) /
            100;
          state.coupon_data.min_win =
            state.coupon_data.min_gross_win - state.coupon_data.min_wth;
          state.coupon_data.gross_win = split_props.max_bonus + max_winnings;
          state.coupon_data.wth_tax =
            ((state.coupon_data.gross_win - state.coupon_data.stake) *
              (global_vars.wth_perc || 5)) /
            100;
          state.coupon_data.max_win =
            state.coupon_data.gross_win - state.coupon_data.wth_tax;
          */
        } else {
          // Add selection to selections list
          state.coupon_data.selections.push(selection_data);
          state.coupon_data.total_odds = Number(
            (
              parseFloat(state.coupon_data.total_odds.toString()) *
              parseFloat(selection_data.odds)
            ).toFixed(2)
          );

          state.coupon_data.tournaments = groupTournament(
            state.coupon_data.selections
          );
          state.coupon_data.fixtures = groupSelections(
            state.coupon_data.selections
          );

          if (bet_type === "live") state.coupon_data.has_live = true;

          // Handle different bet types
          if (state.coupon_data.bet_type === "Split") {
            const split_props = getSplitProps(state.coupon_data);
            state.coupon_data.min_stake =
              split_props.stake / split_props.no_of_combos;

            const min_winnings =
              split_props.min_odds * state.coupon_data.min_stake;
            const max_winnings =
              split_props.max_odds * state.coupon_data.min_stake;

            state.coupon_data.min_bonus = calculateBonus(
              state.coupon_data,
              global_vars,
              bonus_list
            );
            state.coupon_data.min_gross_win =
              state.coupon_data.min_bonus + min_winnings;
            state.coupon_data.min_wth =
              ((state.coupon_data.min_gross_win - state.coupon_data.stake) *
                (global_vars.wth_perc || 5)) /
              100;
            state.coupon_data.min_win =
              state.coupon_data.min_gross_win - state.coupon_data.min_wth;
            state.coupon_data.gross_win = split_props.max_bonus + max_winnings;
            const wth_tax =
              ((state.coupon_data.gross_win - state.coupon_data.stake) *
                (global_vars.wth_perc || 5)) /
              100;
            state.coupon_data.wth_tax = wth_tax < 1 ? 0 : wth_tax;
            state.coupon_data.max_win =
              state.coupon_data.gross_win - state.coupon_data.wth_tax;
          } else {
            // Calculate combinations for Combo bets
            const calculated_group = calcCombinations(state.coupon_data);
            state.coupon_data.combos = calculated_group.groups;

            if (state.coupon_data.bet_type === "Combo") {
              if (
                state.coupon_data.groupings &&
                state.coupon_data.groupings.length
              ) {
                // Update combo winnings from total
                const updated_coupon = updateComboWinningsFromTotal(
                  state.coupon_data,
                  global_vars,
                  bonus_list
                );
                Object.assign(state.coupon_data, updated_coupon);
              }
            } else {
              state.coupon_data.betslip_type = "Multiple";
              state.coupon_data.bet_type = "Multiple";
              const winnings = calculateWinnings(
                state.coupon_data,
                global_vars,
                bonus_list
              );
              state.coupon_data.max_win = winnings.max_win;
              state.coupon_data.max_bonus = winnings.max_bonus;
              state.coupon_data.wth_tax = winnings.wth_tax;
              state.coupon_data.gross_win = winnings.gross_win;
            }
          }
        }
      }

      // Update simple betting state for compatibility
      state.selected_bets = state.coupon_data.selections.map((sel: any) => ({
        game_id: sel.game_id,
        odds_type: sel.outcome_name,
        odds_value: parseFloat(sel.odds),
        game: sel,
        is_active: true,
      })) as any;

      state.total_odds = calculateTotalOdds(state.selected_bets);
      state.potential_winnings = calculatePotentialWinnings(
        state.total_odds,
        state.stake
      );
    },
    toggleActiveSelection: (
      state: BettingState,
      action: PayloadAction<ToggleActiveSelectionPayload>
    ) => {
      const { event_id, display_name } = action.payload;

      // Find the bet in selected_bets array
      const betIndex = state.selected_bets.findIndex(
        (bet) =>
          bet.game.event_id === String(event_id) &&
          bet.game.display_name === display_name
      );

      if (betIndex !== -1) {
        // Toggle the is_active state
        state.selected_bets[betIndex].is_active =
          !state.selected_bets[betIndex].is_active;
      }

      // Also update in coupon_data selections if it exists there
      const selectionIndex = state.coupon_data.selections.findIndex(
        (sel: any) =>
          sel.event_id === event_id && sel.display_name === display_name
      );

      if (selectionIndex !== -1) {
        if (!state.coupon_data.selections[selectionIndex].is_active) {
          state.coupon_data.selections[selectionIndex].is_active = true;
        } else {
          state.coupon_data.selections[selectionIndex].is_active = false;
        }
      }
    },

    removeBet: (
      state: BettingState,
      action: PayloadAction<RemoveBetPayload>
    ) => {
      const {
        event_id,
        display_name,
        global_vars = {},
        bonus_list = [],
      } = action.payload;

      // Remove the specific selection
      state.coupon_data.selections = state.coupon_data.selections.filter(
        (sel: any) =>
          !(sel.event_id === event_id && sel.display_name === display_name)
      );

      if (state.coupon_data.selections.length === 0) {
        // Reset coupon if no selections left
        // state.coupon_data = {
        //   selections: [],
        //   total_odds: 1,
        //   stake: 0,
        //   max_win: 0,
        //   min_win: 0,
        //   max_bonus: 0,
        //   min_bonus: 0,
        //   bet_type: "Single",
        // };
        state.selected_bets = [];
        state.total_odds = 1;
        state.potential_winnings = 0;
        return;
      }

      // Recalculate total odds
      state.coupon_data.total_odds = Number(
        state.coupon_data.selections
          .reduce((total: number, sel: any) => total * parseFloat(sel.odds), 1)
          .toFixed(2)
      );

      // Update groupings and recalculate
      state.coupon_data.tournaments = groupTournament(
        state.coupon_data.selections
      );
      state.coupon_data.fixtures = groupSelections(
        state.coupon_data.selections
      );

      // Recalculate based on remaining selections
      if (state.coupon_data.selections.length === 1) {
        state.coupon_data.bet_type = "Single";
        const winnings = calculateWinnings(
          state.coupon_data,
          global_vars,
          bonus_list
        );
        state.coupon_data.max_win = winnings.max_win;
        state.coupon_data.max_bonus = winnings.max_bonus;
        state.coupon_data.gross_win = winnings.gross_win;
        state.coupon_data.wth_tax = winnings.wth_tax;
      } else {
        // Recalculate for multiple selections
        const calculated_group = calcCombinations(state.coupon_data);
        state.coupon_data.combos = calculated_group.groups;

        if (state.coupon_data.bet_type === "Combo") {
          const updated_coupon = updateComboWinningsFromTotal(
            state.coupon_data,
            global_vars,
            bonus_list
          );
          Object.assign(state.coupon_data, updated_coupon);
        } else {
          const winnings = calculateWinnings(
            state.coupon_data,
            global_vars,
            bonus_list
          );
          state.coupon_data.max_win = winnings.max_win;
          state.coupon_data.max_bonus = winnings.max_bonus;
          state.coupon_data.gross_win = winnings.gross_win;
          state.coupon_data.wth_tax = winnings.wth_tax;
        }
      }

      // Update simple betting state for compatibility
      state.selected_bets = state.coupon_data.selections.map((sel: any) => ({
        game_id: sel.game_id,
        odds_type: sel.outcome_name,
        odds_value: parseFloat(sel.odds),
        game: sel,
      })) as any;

      state.total_odds = calculateTotalOdds(state.selected_bets);
      state.potential_winnings = calculatePotentialWinnings(
        state.total_odds,
        state.stake
      );
    },

    updateStake: (
      state: BettingState,
      action: PayloadAction<UpdateStakePayload>
    ) => {
      const { stake, global_vars = {}, bonus_list = [] } = action.payload;
      state.stake = Number(stake);
      state.coupon_data.stake = stake;
      console.log("Updated stake in coupon_data:", state.coupon_data.stake);

      // Check current bet_type from Redux state and handle accordingly
      if (
        state.bet_type === BET_TYPES_ENUM.COMBINED ||
        state.coupon_data.bet_type === "Combo"
      ) {
        // Combined bet type: distribute stake across checked combos
        const checkedCombos = state.coupon_data.combos.filter(
          (combo: any) => combo.checked
        );

        if (checkedCombos.length > 0) {
          // Calculate total combinations from checked combos
          const totalCombinations = checkedCombos.reduce(
            (sum: number, combo: any) =>
              sum + (combo.combinations || combo.Combinations || 0),
            0
          );

          if (totalCombinations > 0) {
            // Distribute stake equally per combination
            const stakePerCombination = Number(stake) / totalCombinations;

            // Update each checked combo with distributed stake
            state.coupon_data.combos.forEach((combo: any, index: number) => {
              if (
                combo.checked &&
                (combo.combinations > 0 || combo.Combinations > 0)
              ) {
                combo.stake_per_combination = stakePerCombination;

                // Calculate min/max odds for this combo
                const grouping = combo.grouping || combo.Grouping || 2;
                const sortedOdds = state.selected_bets
                  .map((bet: any) => bet.odds_value)
                  .sort((a: number, b: number) => a - b);

                const minOddsForCombo = sortedOdds
                  .slice(0, grouping)
                  .reduce((total: number, odds: number) => total * odds, 1);
                const maxOddsForCombo = sortedOdds
                  .slice(-grouping)
                  .reduce((total: number, odds: number) => total * odds, 1);

                combo.min_win =
                  minOddsForCombo *
                  stakePerCombination *
                  (combo.combinations || combo.Combinations);
                combo.max_win =
                  maxOddsForCombo *
                  stakePerCombination *
                  (combo.combinations || combo.Combinations);
              }
            });

            // Recalculate totals
            let totalMinWin = 0;
            let totalMaxWin = 0;

            state.coupon_data.combos.forEach((combo: any) => {
              if (combo.checked) {
                totalMinWin += combo.min_win || 0;
                totalMaxWin += combo.max_win || 0;
              }
            });

            state.coupon_data.min_win = totalMinWin;
            state.coupon_data.max_win = totalMaxWin;
          }
        }

        // Also use the legacy combo update function for backward compatibility
        const updated_coupon = updateComboWinningsFromTotal(
          state.coupon_data,
          global_vars,
          bonus_list
        );
        Object.assign(state.coupon_data, updated_coupon);
      } else {
        // Non-combined bet types: use existing logic
        if (state.coupon_data.bet_type === "Single") {
          const winnings = calculateWinnings(
            state.coupon_data,
            global_vars,
            bonus_list
          );
          state.coupon_data.max_win = winnings.max_win;
          state.coupon_data.max_bonus = winnings.max_bonus;
          state.coupon_data.gross_win = winnings.gross_win;
          state.coupon_data.wth_tax = winnings.wth_tax;
        } else if (state.coupon_data.bet_type === "Multiple") {
          const winnings = calculateWinnings(
            state.coupon_data,
            global_vars,
            bonus_list
          );
          state.coupon_data.max_win = winnings.max_win;
          state.coupon_data.max_bonus = winnings.max_bonus;
          state.coupon_data.gross_win = winnings.gross_win;
          state.coupon_data.wth_tax = winnings.wth_tax;
        } else if (state.coupon_data.bet_type === "Split") {
          const split_props = getSplitProps(state.coupon_data);
          state.coupon_data.min_stake =
            split_props.stake / split_props.no_of_combos;

          const min_winnings =
            split_props.min_odds * state.coupon_data.min_stake;
          const max_winnings =
            split_props.max_odds * state.coupon_data.min_stake;

          state.coupon_data.min_bonus = calculateBonus(
            state.coupon_data,
            global_vars,
            bonus_list
          );
          state.coupon_data.min_gross_win =
            state.coupon_data.min_bonus + min_winnings;
          state.coupon_data.min_wth =
            ((state.coupon_data.min_gross_win - state.coupon_data.stake) *
              (global_vars.wth_perc || 5)) /
            100;
          state.coupon_data.min_win =
            state.coupon_data.min_gross_win - state.coupon_data.min_wth;
          state.coupon_data.gross_win = split_props.max_bonus + max_winnings;
          const wth_tax =
            ((state.coupon_data.gross_win - state.coupon_data.stake) *
              (global_vars.wth_perc || 5)) /
            100;
          state.coupon_data.wth_tax = wth_tax < 1 ? 0 : wth_tax;
          state.coupon_data.max_win =
            state.coupon_data.gross_win - state.coupon_data.wth_tax;
        }
      }

      state.potential_winnings = calculatePotentialWinnings(
        state.total_odds,
        state.stake
      );
    },

    updateComboStake: (
      state: BettingState,
      action: PayloadAction<UpdateComboStakePayload>
    ) => {
      const {
        combo_index,
        stake,
        global_vars = {},
        bonus_list = [],
      } = action.payload;

      // Update the specific combo's stake
      if (state.coupon_data.combos && state.coupon_data.combos[combo_index]) {
        state.coupon_data.combos[combo_index].stake_per_combination = stake;

        // Calculate min/max win for this combo
        const combo = state.coupon_data.combos[combo_index];
        const grouping = combo.grouping;
        const combinations = combo.combinations;

        if (state.selected_bets.length >= grouping) {
          const sortedOdds = state.selected_bets
            .map((bet) => bet.odds_value)
            .sort((a, b) => a - b);

          const minOddsForCombo = sortedOdds
            .slice(0, grouping)
            .reduce((total, odds) => total * odds, 1);
          const maxOddsForCombo = sortedOdds
            .slice(-grouping)
            .reduce((total, odds) => total * odds, 1);

          state.coupon_data.combos[combo_index].min_win =
            minOddsForCombo * stake * combinations;
          state.coupon_data.combos[combo_index].max_win =
            maxOddsForCombo * stake * combinations;
        }

        // Recalculate total stake from all combos
        const totalStake = state.coupon_data.combos.reduce(
          (total: number, combo: any) => {
            if (combo.stake_per_combination && combo.combinations) {
              return total + combo.combinations * combo.stake_per_combination;
            }
            return total;
          },
          0
        );

        state.coupon_data.total_stake = totalStake;
        state.stake = totalStake;

        // Recalculate total min/max wins
        const totalMinWin = state.coupon_data.combos.reduce(
          (total: number, combo: any) => total + (combo.min_win || 0),
          0
        );
        const totalMaxWin = state.coupon_data.combos.reduce(
          (total: number, combo: any) => total + (combo.max_win || 0),
          0
        );

        state.coupon_data.min_win = totalMinWin;
        state.coupon_data.max_win = totalMaxWin;
      }
    },

    toggleComboChecked: (
      state: BettingState,
      action: PayloadAction<{ combo_index: number }>
    ) => {
      const { combo_index } = action.payload;

      if (state.coupon_data.combos && state.coupon_data.combos[combo_index]) {
        // Toggle the checked state
        state.coupon_data.combos[combo_index].checked =
          !state.coupon_data.combos[combo_index].checked;
      }
    },

    clearBets: (state: BettingState) => {
      state.selected_bets = [];
      state.total_odds = 1;
      state.potential_winnings = 0;
      state.stake = 0;
      state.coupon_data = {
        selections: [],
        combos: [],
        total_odds: 1,
        max_bonus: 0,
        min_bonus: 0,
        max_win: 0,
        min_win: 0,
        stake: 0,
        total_stake: 0,
        min_odds: 1,
        max_odds: 1,
        event_type: "prematch",
        channel: "website",
        wth_tax: 0,
        excise_duty: 0,
        groupings: [],
        bet_type: "Single",
        betslip_type: "Single",
      };
    },

    updateOdds: (
      state: BettingState,
      action: PayloadAction<{
        match_id: number;
        outcome_id: string;
        new_odds: number;
        market_id?: number;
        global_vars?: any;
        bonus_list?: any[];
      }>
    ) => {
      const {
        match_id,
        outcome_id,
        new_odds,
        market_id,
        // global_vars = {},
        // bonus_list = [],
      } = action.payload;

      // Track odds change for fixtures (regardless of whether bet is selected)
      const key = `${match_id}_${outcome_id}`;
      const now = Date.now();
      const existingChange = state.odds_changes[key];
      const previousOdds = existingChange?.current_odds || new_odds;

      // Only track if odds actually changed
      if (previousOdds !== new_odds) {
        const change_direction = new_odds > previousOdds ? "up" : "down";

        state.odds_changes[key] = {
          match_id,
          outcome_id,
          market_id: market_id || 0,
          previous_odds: previousOdds,
          current_odds: new_odds,
          change_direction,
          timestamp: now,
          display_until: now + state.display_duration,
        };

        console.log(
          `🎯 Odds change tracked: ${outcome_id} ${previousOdds} → ${new_odds} (${change_direction})`
        );
      }

      // Find and update the bet in selected_bets
      const betIndex = state.selected_bets.findIndex(
        (bet) => bet.match_id === match_id && bet.game.outcome_id === outcome_id
      );

      if (betIndex !== -1) {
        const bet = state.selected_bets[betIndex];
        const previousBetOdds = bet.odds_value;
        const oddsChangeDirection =
          new_odds > previousBetOdds
            ? "up"
            : new_odds < previousBetOdds
              ? "down"
              : "unchanged";

        // Update the bet with new odds and change tracking
        state.selected_bets[betIndex] = {
          ...bet,
          odds_value: new_odds,
          previous_odds: previousBetOdds,
          odds_change_direction: oddsChangeDirection,
          last_updated: now,
          display_until: now + state.display_duration,
          game: {
            ...bet.game,
            odds: new_odds.toString(),
          },
        };

        // Recalculate coupon data
        state.total_odds = state.selected_bets.reduce(
          (total, bet) => total * bet.odds_value,
          1
        );
        state.potential_winnings = calculatePotentialWinnings(
          state.total_odds,
          state.stake
        );
      }

      // Also update in coupon_data.selections
      const selectionIndex = state.coupon_data.selections.findIndex(
        (selection: any) =>
          selection.match_id === match_id && selection.outcome_id === outcome_id
      );

      if (selectionIndex !== -1) {
        const previousOdds = parseFloat(
          state.coupon_data.selections[selectionIndex].odds
        );
        state.coupon_data.selections[selectionIndex] = {
          ...state.coupon_data.selections[selectionIndex],
          odds: new_odds.toString(),
          previous_odds: previousOdds,
          odds_change_direction:
            new_odds > previousOdds
              ? "up"
              : new_odds < previousOdds
                ? "down"
                : "unchanged",
          last_updated: Date.now(),
        };
      }
    },

    setLoading: (state: BettingState, action: PayloadAction<boolean>) => {
      state.is_loading = action.payload;
    },

    setError: (state: BettingState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Live betting actions
    updateLiveOdds: (
      state: BettingState,
      action: PayloadAction<{
        event_id: number;
        market_id: number;
        outcomes: LiveOutcome[];
      }>
    ) => {
      const { event_id, outcomes } = action.payload;

      // Update odds in selected bets if they match
      state.selected_bets.forEach((bet) => {
        if (bet.game_id === event_id) {
          // Find matching outcome and update odds
          const matchingOutcome = outcomes.find(
            (outcome) => outcome.id === bet.game.outcome_id
          );
          if (matchingOutcome) {
            bet.odds_value = matchingOutcome.odds;
            bet.game.odds = matchingOutcome.odds.toString();
          }
        }
      });

      // Recalculate total odds and potential winnings
      state.total_odds = calculateTotalOdds(state.selected_bets);
      state.potential_winnings = calculatePotentialWinnings(
        state.total_odds,
        state.stake
      );
    },

    updateLiveMarketStatus: (
      state: BettingState,
      action: PayloadAction<{
        event_id: number;
        market_id: number;
        status: number;
      }>
    ) => {
      const { event_id, market_id, status } = action.payload;

      // Update market status in selected bets
      state.selected_bets.forEach((bet) => {
        if (bet.game_id === event_id && bet.game.market_id === market_id) {
          bet.game.market_status = status;
        }
      });
    },

    suspendLiveBets: (
      state: BettingState,
      action: PayloadAction<{
        event_id: number;
        market_ids?: number[];
      }>
    ) => {
      const { event_id, market_ids } = action.payload;

      // Suspend bets for the specified event and markets
      state.selected_bets.forEach((bet) => {
        if (bet.game_id === event_id) {
          if (!market_ids || market_ids.includes(bet.game.market_id)) {
            bet.game.market_status = 1; // suspended
          }
        }
      });
    },

    settleLiveBets: (
      state: BettingState,
      action: PayloadAction<{
        event_id: number;
        market_ids?: number[];
      }>
    ) => {
      const { event_id, market_ids } = action.payload;

      // Settle bets for the specified event and markets
      state.selected_bets.forEach((bet) => {
        if (bet.game_id === event_id) {
          if (!market_ids || market_ids.includes(bet.game.market_id)) {
            bet.game.market_status = 3; // settled
          }
        }
      });
    },

    cancelLiveBets: (
      state: BettingState,
      action: PayloadAction<{
        event_id: number;
        market_ids?: number[];
      }>
    ) => {
      const { event_id, market_ids } = action.payload;

      // Cancel bets for the specified event and markets
      state.selected_bets.forEach((bet) => {
        if (bet.game_id === event_id) {
          if (!market_ids || market_ids.includes(bet.game.market_id)) {
            bet.game.market_status = 4; // cancelled
          }
        }
      });
    },

    // Clear expired odds changes
    clearExpiredOddsChanges: (state: BettingState) => {
      const now = Date.now();
      Object.keys(state.odds_changes).forEach((key) => {
        if (state.odds_changes[key].display_until <= now) {
          delete state.odds_changes[key];
        }
      });
    },

    // Clear all odds changes
    clearAllOddsChanges: (state: BettingState) => {
      state.odds_changes = {};
    },

    // Clear odds changes for a specific match
    clearOddsChangesForMatch: (
      state: BettingState,
      action: PayloadAction<number>
    ) => {
      const match_id = action.payload;
      Object.keys(state.odds_changes).forEach((key) => {
        if (state.odds_changes[key].match_id === match_id) {
          delete state.odds_changes[key];
        }
      });
    },

    // Set display duration for odds changes
    setOddsDisplayDuration: (
      state: BettingState,
      action: PayloadAction<number>
    ) => {
      state.display_duration = action.payload;
    },

    // Suspend all markets for a specific match
    suspendAllMarketsForMatch: (
      state: BettingState,
      action: PayloadAction<number>
    ) => {
      const matchId = action.payload;

      // Update all selected bets for this match
      state.selected_bets.forEach((bet) => {
        if (bet.match_id === matchId) {
          bet.game.market_status = 1; // suspended
        }
      });

      // Update all coupon selections for this match
      state.coupon_data.selections.forEach((selection: any) => {
        if (selection.match_id === matchId) {
          selection.market_status = 1; // suspended
        }
      });
    },
    setBetslip: (
      state: BettingState,
      action: PayloadAction<BetSlip | null>
    ) => {
      state.betslip = action.payload;
    },
    updateBetType: (
      state: BettingState,
      action: PayloadAction<UpdateBetTypePayload>
    ) => {
      const { bet_type } = action.payload;
      state.bet_type = bet_type;
      state.coupon_data.bet_type =
        bet_type === "multiple"
          ? "Multiple"
          : bet_type === "combined"
            ? "Combined"
            : "Split";
    },
  },
});

export const {
  addBet,
  setBetslip,
  removeBet,
  updateStake,
  updateComboStake,
  toggleComboChecked,
  clearBets,
  updateOdds,
  setLoading,
  setError,
  toggleActiveSelection,
  updateLiveOdds,
  updateLiveMarketStatus,
  suspendLiveBets,
  settleLiveBets,
  cancelLiveBets,
  clearExpiredOddsChanges,
  clearAllOddsChanges,
  clearOddsChangesForMatch,
  setOddsDisplayDuration,
  suspendAllMarketsForMatch,
  updateBetType,
} = BettingSlice.actions;

// Helper function to check if a specific bet is selected
export const isBetSelected = ({
  selected_bets,
  game_id,
  odds_type,
  market_id,
  specifier,
  outcome_id,
}: {
  selected_bets: SelectedBet[];
  game_id: number;
  odds_type: string;
  market_id: number;
  specifier: string;
  outcome_id: string;
}) => {
  // console.log("Checking if bet is selected with params:", {
  //   game_id,
  //   odds_type,
  //   market_id,
  //   specifier,
  //   outcome_id,
  // });
  const bet = selected_bets.some(
    (bet) =>
      bet.game_id == game_id &&
      bet.game.display_name == odds_type &&
      bet.game.market_id == market_id &&
      bet.game.specifier == specifier &&
      bet.game.outcome_id == outcome_id
  );
  return bet;
};

// Helper function to get all bets for a specific game
export const getBetsForGame = (selected_bets: any[], gameId: string): any[] => {
  return selected_bets.filter((bet) => bet.game_id === gameId);
};

// Selectors for odds changes
export const selectOddsChange = (
  state: { betting: BettingState },
  match_id: number,
  outcome_id: string
) => {
  const key = `${match_id}_${outcome_id}`;
  const change = state.betting?.odds_changes?.[key];
  const now = Date.now();

  // Return change if it's still within display duration
  return change && change.display_until > now ? change : undefined;
};

export const selectAllActiveOddsChanges = (state: {
  betting: BettingState;
}) => {
  const now = Date.now();
  return Object.values(state.betting?.odds_changes || {}).filter(
    (change) => change.display_until > now
  );
};

export const selectOddsChangesForMatch = (
  state: { betting: BettingState },
  match_id: number
) => {
  const now = Date.now();
  return Object.values(state.betting?.odds_changes || {}).filter(
    (change) => change.match_id === match_id && change.display_until > now
  );
};

export default BettingSlice.reducer;
