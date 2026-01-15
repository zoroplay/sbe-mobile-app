import { Dispatch } from "@reduxjs/toolkit";
import CouponCalculation from "../../../utils/CouponCalculation";
import {
  SET_COUPON_DATA,
  UPDATE_COMBO_STAKE,
  UPDATE_COMBO_WINNINGS_FROM_TOTAL,
  type SetCouponDataAction,
  type UpdateComboStakeAction,
  type UpdateComboWinningsFromTotalAction,
} from "../types/coupon.types";

const couponCalculation = new CouponCalculation();

export const setCouponData = (payload: any): SetCouponDataAction => ({
  type: SET_COUPON_DATA,
  payload,
});

export const updateComboStake = (
  index: number,
  stake: number
): UpdateComboStakeAction => ({
  type: UPDATE_COMBO_STAKE,
  payload: { index, stake },
});

export const updateComboWinningsFromTotal =
  (totalStake?: number) => (dispatch: Dispatch, getState: () => any) => {
    const state = getState();
    const { selected_bets, coupon_data } = state.betting;
    const { globalVar, bonusList } = state; // Adjust based on your state structure

    let updatedCouponData = { ...coupon_data };

    if (totalStake !== undefined) {
      updatedCouponData.stake = totalStake;
      updatedCouponData.totalStake = totalStake;
    }

    // Transform selected_bets to the format expected by CouponCalculation
    const transformedCoupon = {
      ...updatedCouponData,
      selections: selected_bets.map((bet: any) => ({
        matchId: bet.match_id,
        odds: bet.odds_value,
        fixed: false,
        Fixed: false,
        OddValue: bet.odds_value,
      })),
    };

    // Calculate combinations if not already done
    if (
      !transformedCoupon.Groupings ||
      transformedCoupon.Groupings.length === 0
    ) {
      const calculatedCombinations =
        couponCalculation.calcCombinations(transformedCoupon);
      transformedCoupon.Groupings = calculatedCombinations.Groups.map(
        (group) => ({
          Grouping: group.Grouping,
          Combinations: group.Combinations,
          Stake: 0,
          checked: false,
        })
      );
    }

    // Calculate potential wins
    const calculatedCoupon = couponCalculation.calcPotentialWins(
      transformedCoupon,
      bonusList || []
    );

    const finalCouponData = couponCalculation.updateFromCalculatedCoupon(
      transformedCoupon,
      calculatedCoupon,
      globalVar,
      bonusList || []
    );

    // Update combos with calculated data
    finalCouponData.combos = finalCouponData.Groupings.map((grouping: any) => ({
      Grouping: grouping.Grouping,
      Combinations: grouping.Combinations,
      Stake: grouping.Stake || 0,
      checked: grouping.checked || false,
      minWin: grouping.minWin || 0,
      maxWin: grouping.maxWin || 0,
    }));

    dispatch({
      type: UPDATE_COMBO_WINNINGS_FROM_TOTAL,
      payload: totalStake,
    });

    dispatch(setCouponData(finalCouponData));
  };
