/* eslint-disable @typescript-eslint/no-unused-vars */

import { apiSlice } from "./constants/api.service";
import { AUTH_ACTIONS } from "./constants/route";
import { REQUEST_ACTIONS } from "./constants/request-types";
import { LoginRequest, RegisterRequest } from "./types/requests";
import { AuthResponse } from "./types/responses";
import { clearTokens, setAccessToken } from "./actions/setAccessTokens";
import { logoutUser, setUser } from "../features/slice/user.slice";
import { AppHelper } from "@/utils/helper";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: AUTH_ACTIONS.EMAIL_LOGIN,
        method: REQUEST_ACTIONS.POST,
        body,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          console.log("data.data.token", data.data.token);
          console.log("data.data", data.data);
          await setAccessToken(data.data.token);
          // await setRefreshToken(String(data.data.id));
          dispatch(setUser(data.data));
        } catch (error) {
          return;
        }
      },
    }),
    refreshUserDetails: builder.query<AuthResponse, void>({
      query: () => ({
        url: AppHelper.buildQueryUrl(AUTH_ACTIONS.AUTH_DETAILS, {}),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await setAccessToken(data.data.token);
          // await storeRefreshToken(String(data.data.id));
          dispatch(setUser(data.data));
        } catch (error) {
          return;
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: AUTH_ACTIONS.REGISTER,
        method: REQUEST_ACTIONS.POST,
        body,
      }),
    }),
    logout: builder.mutation<void, { user_id: string }>({
      query: ({ user_id }) => ({
        url: AUTH_ACTIONS.LOGOUT,
        method: REQUEST_ACTIONS.POST,
        body: { user_id },
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          await clearTokens();
          dispatch(logoutUser());
        } catch (error) {
          return;
        }
      },
    }),
    changePassword: builder.mutation<
      void,
      { clientId: number; oldPassword: string; password: string }
    >({
      query: (body) => ({
        url: AUTH_ACTIONS.CHANGE_PASSWORD,
        method: REQUEST_ACTIONS.PUT,
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshUserDetailsQuery,
  useChangePasswordMutation,
} = authApi;
