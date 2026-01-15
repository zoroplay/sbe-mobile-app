import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
// import { UserState } from "../types/user.types";
import { initialState } from "../constants/user.constants";
import type { UserState } from "../types/user.types";
import type { User } from "../../../data/types/user";
// import { User } from "@/data/types/user";

const UserSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logoutUser: (state: UserState) => {
      state.user = null;
      state.is_authenticated = false;
      state.last_request_time = null;
    },
    setUser: (state: UserState, { payload }: PayloadAction<User>) => {
      console.log("payload", payload);
      state.user = payload;
      state.is_authenticated = true;
    },
    setUserBalance: (
      state: UserState,
      {
        payload,
      }: PayloadAction<{ availableBalance: number; commissionBalance: number }>
    ) => {
      if (state.user) {
        state.user.availableBalance = payload.availableBalance;
        state.user.commissionBalance = payload.commissionBalance;
      }
    },

    setUserRerender: (state: UserState) => {
      if (state.refetch_user >= 10) {
        state.refetch_user = 0;
      }
      state.refetch_user = state.refetch_user + 1;
    },
    setLastRequestTime: (
      state: UserState,
      { payload }: PayloadAction<number>
    ) => {
      state.last_request_time = payload;
    },
  },
});

export const {
  logoutUser,
  setUserRerender,
  setUserBalance,
  setUser,
  setLastRequestTime,
} = UserSlice.actions;
export default UserSlice.reducer;
