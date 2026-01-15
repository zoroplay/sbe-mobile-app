import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

export interface WithdrawalState {
  verifyRequest: any | null;
  approval: any | null;
  loading: boolean;
  verifyLoading: boolean;
  error: string | null;
}

const initialState: WithdrawalState = {
  verifyRequest: null,
  approval: null,
  loading: false,
  verifyLoading: false,
  error: null,
};

const WithdrawalSlice = createSlice({
  name: "withdrawal",
  initialState,
  reducers: {
    setVerifyLoading: (state, action: PayloadAction<boolean>) => {
      state.verifyLoading = action.payload;
    },
    setVerifyRequest: (state, action: PayloadAction<any>) => {
      state.verifyRequest = action.payload;
      state.verifyLoading = false;
    },
    setVerifyError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.verifyLoading = false;
    },
    setWithdrawLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setApproval: (state, action: PayloadAction<any>) => {
      state.approval = action.payload;
      state.loading = false;
    },
    setWithdrawError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    reset: (state) => {
      state.verifyRequest = null;
      state.approval = null;
      state.loading = false;
      state.verifyLoading = false;
      state.error = null;
    },
  },
});

export const {
  setVerifyLoading,
  setVerifyRequest,
  setVerifyError,
  setWithdrawLoading,
  setApproval,
  setWithdrawError,
  clearError,
  reset,
} = WithdrawalSlice.actions;

// Selectors
export const selectWithdrawal = (state: RootState) => state.withdrawal;
export const selectVerifyRequest = (state: RootState) =>
  state.withdrawal.verifyRequest;
export const selectVerifyLoading = (state: RootState) =>
  state.withdrawal.verifyLoading;
export const selectWithdrawLoading = (state: RootState) =>
  state.withdrawal.loading;
export const selectWithdrawError = (state: RootState) => state.withdrawal.error;

export default WithdrawalSlice.reducer;
