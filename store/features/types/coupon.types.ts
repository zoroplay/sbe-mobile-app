// Coupon action types
export const SET_COUPON_DATA = "SET_COUPON_DATA";
export const UPDATE_COMBO_STAKE = "UPDATE_COMBO_STAKE";
export const UPDATE_COMBO_WINNINGS_FROM_TOTAL =
  "UPDATE_COMBO_WINNINGS_FROM_TOTAL";
export const CALCULATE_COUPON_COMBINATIONS = "CALCULATE_COUPON_COMBINATIONS";
export const CALCULATE_POTENTIAL_WINS = "CALCULATE_POTENTIAL_WINS";
export const SET_COMBO_CHECKED = "SET_COMBO_CHECKED";
export const UPDATE_TOTAL_STAKE = "UPDATE_TOTAL_STAKE";

// Action creators
export interface CouponActionTypes {
  SET_COUPON_DATA: typeof SET_COUPON_DATA;
  UPDATE_COMBO_STAKE: typeof UPDATE_COMBO_STAKE;
  UPDATE_COMBO_WINNINGS_FROM_TOTAL: typeof UPDATE_COMBO_WINNINGS_FROM_TOTAL;
  CALCULATE_COUPON_COMBINATIONS: typeof CALCULATE_COUPON_COMBINATIONS;
  CALCULATE_POTENTIAL_WINS: typeof CALCULATE_POTENTIAL_WINS;
  SET_COMBO_CHECKED: typeof SET_COMBO_CHECKED;
  UPDATE_TOTAL_STAKE: typeof UPDATE_TOTAL_STAKE;
}

export interface SetCouponDataAction {
  type: typeof SET_COUPON_DATA;
  payload: any;
}

export interface UpdateComboStakeAction {
  type: typeof UPDATE_COMBO_STAKE;
  payload: {
    index: number;
    stake: number;
  };
}

export interface UpdateComboWinningsFromTotalAction {
  type: typeof UPDATE_COMBO_WINNINGS_FROM_TOTAL;
  payload?: number;
}

export type CouponAction =
  | SetCouponDataAction
  | UpdateComboStakeAction
  | UpdateComboWinningsFromTotalAction;
