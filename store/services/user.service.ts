/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { USER_ACTIONS } from "./constants/route";
import { setUser, setUserBalance } from "../features/slice/user.slice";
import { apiSlice } from "./constants/api.service";
import { REQUEST_ACTIONS } from "./constants/request-types";
import type { User, ValidateUserResponse } from "../../data/types/user";
import type {
  CommissionRequest,
  PayoutCommissionRequest,
  DepositCommissionRequest,
} from "./types/requests";
import type {
  CommissionTransactionsResponse,
  UserCommissionResponse,
  UserCommissionProfileResponse,
} from "./types/responses";
import { AppHelper } from "@/utils/helper";

const UserApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchMyAccount: builder.mutation<User, void>({
      query: () => ({
        url: `${USER_ACTIONS.GET_USER}`,
        method: "GET",
        rateLimit: {
          maxRequests: 3, // Only 3 requests
          windowMs: 30000, // Per 30 seconds
        },
      }),
      extraOptions: {
        subscribeOnFocus: false,
        subscribeOnReconnect: false,
        refetchOnMountOrArgChange: false,
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
        } catch (error) {
          // Silently handle error
          return;
        }
      },
    }),
    fetchUserContacts: builder.query<User[], { name: string }>({
      query: ({ name }) => ({
        url: `${USER_ACTIONS.GET_USER_CONTACTS}?name=${name}`,
        method: "GET",
      }),
    }),
    fetchUserCommissionBalance: builder.query<
      { data: { available_balance: number; commission_balance: number } },
      void
    >({
      query: () => ({
        url: AppHelper.buildQueryUrl(
          USER_ACTIONS.GET_USER_COMMISSION_BALANCE,
          {}
        ),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setUserBalance({
              availableBalance: data.data.available_balance,
              commissionBalance: data.data.commission_balance,
            })
          );
        } catch (error) {
          // Silently handle error
          return;
        }
      },
    }),
    creditPlayer: builder.mutation<any, { amount: number; userId: number }>({
      query: ({ amount, userId }) => ({
        url: AppHelper.buildQueryUrl(USER_ACTIONS.CREDIT_PLAYER, { amount }),
        method: REQUEST_ACTIONS.POST,
        body: {
          amount,
          userId,
        },
      }),
    }),
    validateUser: builder.mutation<
      ValidateUserResponse,
      { searchKey: string; clientId: number }
    >({
      query: ({ searchKey, clientId }) => ({
        url: AppHelper.buildQueryUrl(USER_ACTIONS.VALIDATE_USER, {}),
        method: REQUEST_ACTIONS.POST,
        body: {
          searchKey,
          clientId,
        },
      }),
    }),
    commissionTransactions: builder.query<CommissionTransactionsResponse, void>(
      {
        query: () => ({
          url: AppHelper.buildQueryUrl(USER_ACTIONS.COMMISSION_PROFILE, {}),
          method: REQUEST_ACTIONS.GET,
        }),
      }
    ),
    commissionPayout: builder.mutation<any, CommissionRequest>({
      query: (body) => ({
        url: AppHelper.buildQueryUrl(USER_ACTIONS.COMMISSION_PAYOUT, {}),
        method: REQUEST_ACTIONS.POST,
        body,
      }),
    }),
    userCommission: builder.query<UserCommissionResponse, { user_id: number }>({
      query: ({ user_id }) => ({
        url: AppHelper.buildQueryUrl(USER_ACTIONS.USER_COMMISSION, { user_id }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    // userCommissionProfile: builder.query<
    //   UserCommissionProfileResponse,
    //   { user_id: number; commission_type: string }
    // >({
    //   query: ({ user_id }) => ({
    //     url: AppHelper.buildQueryUrl(USER_ACTIONS.USER_COMMISSION_PROFILE, {
    //       user_id,
    //     }),
    //     method: REQUEST_ACTIONS.GET,
    //   }),
    // }),
    payoutCommission: builder.mutation<any, PayoutCommissionRequest>({
      query: (body) => ({
        url: AppHelper.buildQueryUrl(USER_ACTIONS.PAYOUT_COMMISSION, {}),
        method: REQUEST_ACTIONS.POST,
        body,
      }),
    }),
    depositCommission: builder.mutation<any, DepositCommissionRequest>({
      query: (body) => ({
        url: AppHelper.buildQueryUrl(USER_ACTIONS.DEPOSIT_COMMISSION, {}),
        method: REQUEST_ACTIONS.POST,
        body,
      }),
    }),
    getAgentUsers: builder.query<
      { success: boolean; data: User[] },
      { agentId: number; clientId: number }
    >({
      query: ({ agentId, clientId }) => ({
        url: AppHelper.buildQueryUrl(USER_ACTIONS.GET_AGENT_USERS, {
          client_id: clientId,
          agent_id: agentId,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useFetchMyAccountMutation,
  useFetchUserContactsQuery,
  useFetchUserCommissionBalanceQuery,
  useCreditPlayerMutation,
  useValidateUserMutation,
  useCommissionTransactionsQuery,
  useCommissionPayoutMutation,
  useUserCommissionQuery,
  // useUserCommissionProfileQuery,
  usePayoutCommissionMutation,
  useDepositCommissionMutation,
  useGetAgentUsersQuery,
} = UserApiSlice;
