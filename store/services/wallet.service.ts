/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "./constants/api.service";
import { REQUEST_ACTIONS } from "./constants/request-types";
import { WALLET_ACTIONS } from "./constants/route";
import { Bank, TransferFundsResponse } from "./types/responses";
import {
  WithdrawVerifyDto,
  WithdrawCreateDto,
  VerifyBankAccountDto,
  BankWithdrawalDto,
  TransferFundsDto,
} from "./types/requests";
import {
  PaymentMethodsResponse,
  InitializeTransactionResponse,
  InitializeTransactionDto,
  WithdrawVerifyResponse,
  WithdrawCreateResponse,
  PendingWithdrawalsResponse,
  GetBanksResponse,
  VerifyBankAccountResponse,
  BankWithdrawalResponse,
} from "./types/responses";
import { AppHelper } from "@/utils/helper";

const WalletApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    fetchPaymentMethods: builder.query<PaymentMethodsResponse, void>({
      query: () => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.GET_PAYMENT_METHODS, {}),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    initiateDeposit: builder.mutation<
      InitializeTransactionResponse,
      InitializeTransactionDto
    >({
      query: ({ clientId, ...data }) => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.INITIALIZE_DEPOSIT, {}),
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),
    verifyWithdraw: builder.mutation<
      WithdrawVerifyResponse,
      WithdrawVerifyDto & { clientId: string }
    >({
      query: ({ clientId, ...data }) => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.VERIFY_WITHDRAWAL, {}),
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),
    createWithdraw: builder.mutation<
      WithdrawCreateResponse,
      WithdrawCreateDto & { clientId: string }
    >({
      query: ({ clientId, ...data }) => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.CREATE_WITHDRAWAL, {}),
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),
    cancelWithdraw: builder.mutation<
      WithdrawCreateResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.CANCEL_WITHDRAWAL, {}),
        method: REQUEST_ACTIONS.PATCH,
      }),
    }),
    getPendingWithdrawals: builder.query<
      PendingWithdrawalsResponse,
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.PENDING_WITHDRAWALS, {}),
        method: REQUEST_ACTIONS.GET,
      }),
      // providesTags: ["Withdrawal"],
    }),
    getBanks: builder.query<Bank[], void>({
      query: () => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.GET_BANKS, {}),
        method: REQUEST_ACTIONS.GET,
      }),
      transformResponse: (response: GetBanksResponse) => {
        const res = Array.isArray(response.data) ? response.data : [];
        return res;
      },
    }),
    verifyBankAccount: builder.mutation<
      VerifyBankAccountResponse,
      VerifyBankAccountDto
    >({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.VERIFY_BANK_ACCOUNT, {}),
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),

    bankWithdrawal: builder.mutation<BankWithdrawalResponse, BankWithdrawalDto>(
      {
        query: ({ clientId, ...data }) => ({
          url: AppHelper.buildQueryUrl(WALLET_ACTIONS.BANK_WITHDRAWAL, {}),
          method: REQUEST_ACTIONS.POST,
          body: data,
        }),
      }
    ),
    transferFunds: builder.mutation<TransferFundsResponse, TransferFundsDto>({
      query: (body) => ({
        url: AppHelper.buildQueryUrl(WALLET_ACTIONS.TRANSFER_FUNDS, {}),
        method: REQUEST_ACTIONS.POST,
        body,
      }),
    }),
  }),
});

export const {
  useFetchPaymentMethodsQuery,
  useLazyFetchPaymentMethodsQuery,
  useInitiateDepositMutation,
  useVerifyWithdrawMutation,
  useCreateWithdrawMutation,
  useCancelWithdrawMutation,
  useGetPendingWithdrawalsQuery,
  useLazyGetPendingWithdrawalsQuery,
  useGetBanksQuery,
  useLazyGetBanksQuery,
  useVerifyBankAccountMutation,
  useBankWithdrawalMutation,
  useTransferFundsMutation,
} = WalletApiSlice;
