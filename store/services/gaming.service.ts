/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BETTING_ACTIONS, GAMING_ACTIONS } from "./constants/route";
import { apiSlice } from "./constants/api.service";
import { REQUEST_ACTIONS } from "./constants/request-types";

import {
  ApiResponse,
  Game,
  GameCategory,
  ProvidersResponse,
} from "./types/responses";
import { AppHelper } from "@/utils/helper";
import { StartGameRequest } from "./types/requests";

const BetsApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    gamesCategories: builder.query<ApiResponse<GameCategory>, void>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(GAMING_ACTIONS.GAMES_CATEGORIES, {}),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    gameList: builder.query<ApiResponse<Game>, { category_id: string }>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(GAMING_ACTIONS.GAMES_LIST, {
          category_id: data.category_id || "",
        }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    gameProviders: builder.query<ApiResponse<ProvidersResponse>, void>({
      query: () => ({
        url: AppHelper.buildQueryUrl(GAMING_ACTIONS.GAMES_PROVIDERS, {}),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    gameProviderList: builder.query<
      ApiResponse<ProvidersResponse>,
      { provider_id?: string; category_id?: string; game_name?: string }
    >({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(GAMING_ACTIONS.GAME_PROVIDER, {
          category_id: data.category_id || "",
          provider_id: data.provider_id || "",
          game_name: data.game_name || "",
        }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    gameStart: builder.query<ApiResponse<{ url: string }>, StartGameRequest>({
      query: (body) => ({
        url: AppHelper.buildQueryUrl(GAMING_ACTIONS.CASINO_START_GAME, {}),
        method: REQUEST_ACTIONS.POST,
        body,
      }),
    }),
  }),
});

export const {
  useGamesCategoriesQuery,
  useGameListQuery,
  useGameProvidersQuery,
  useGameProviderListQuery,
  useLazyGameProviderListQuery,
  useGameStartQuery,
} = BetsApiSlice;
