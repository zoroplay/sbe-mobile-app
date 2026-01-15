import { apiSlice } from "./constants/api.service";
import { ServerGlobalVariablesResponse } from "./types/responses";
import { AUTH_ACTIONS } from "./constants/route";
import { REQUEST_ACTIONS } from "./constants/request-types";
import { setGlobalVariables } from "../features/slice/app.slice";
import { AppHelper } from "@/utils/helper";

const AuthApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGlobalVariables: builder.query<ServerGlobalVariablesResponse, void>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(AUTH_ACTIONS.GLOBAL_VARIABLES, {}),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setGlobalVariables({
              allow_registeration: data.data.AllowRegistration,
              enable_split_bet: data.data.EnableSplitBet,
              enable_system_bet: data.data.EnableSystemBet,
              combo_max_style: data.data.comboMaxStake,
              min_bet_stake: data.data.MinBetStake,
              combo_min_stake: data.data.comboMinStake,
              max_combination_odd_length: data.data.MaxCombinationOddLength,
              currency_code: data.data.CurrencyCode,
              currency: data.data.Currency,
              dial_code: data.data.DialCode,
              enable_bank_acct: data.data.EnableBankAcct,
              enable_cashout: data.data.enableCashout,
              tax_enabled: data.data.taxEnabled,
              excise_tax: data.data.exciseTax,
              liability_threshold: data.data.LiabilityThreshold,
              live_ticket_max: data.data.LiveTicketMax,
              logo: data.data.Logo,
              max_payout: data.data.MaxPayout,
              min_bonus_odd: data.data.MinBonusOdd,
              min_deposit: data.data.MinDeposit,
              min_withdrawal: data.data.MinWithdrawal,
              payment_day: data.data.PaymentDay,
              power_bonus_start_date: data.data.PowerBonusStartDate,
              single_max_stake: data.data.singleMaxStake,
              single_max_winning: data.data.SingleMaxWinning,
              single_min_stake: data.data.singleMinStake,
              single_ticket_length: data.data.SingleTicketLenght,
              max_no_of_selection: data.data.MaxNoOfSelection,
              wth_tax: data.data.wthTax,
            })
          );
        } catch (error) {
          return;
        }
      },
    }),
  }),
});

export const { useGetGlobalVariablesQuery } = AuthApiSlice;
