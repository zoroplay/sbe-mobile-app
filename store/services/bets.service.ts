/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BETTING_ACTIONS } from "./constants/route";
import { apiSlice } from "./constants/api.service";
import {
  FixturesDto,
  SportCategoriesDto,
  SportMenuDto,
  SportsMenuResponse,
  SportCategoriesResponse,
  TournamentsDto,
  TournamentsResponse,
  FixturesResponse,
  FindBetDto,
  FixtureResponse,
  PlaceBetDto,
  FindBetResponse,
  FindCouponResponse,
  SportsHighlightResponse,
  FetchFixtureResponse,
  SportsDto,
} from "./data/betting.types";
import { REQUEST_ACTIONS } from "./constants/request-types";
import {
  setFixtures,
  setSearchFixtures,
  setSelectedGame,
  setTopBets,
} from "../features/slice/fixtures.slice";
import { PreMatchFixture } from "../features/types/fixtures.types";
import {
  LiveFixture,
  setLiveFixtures,
} from "../features/slice/live-games.slice";
import {
  GetBetHistoryResponse,
  GetBetListDto,
  GetBetListResponse,
  GetTransactionsDto,
  GetTransactionsResponse,
} from "./data/queries.types";
import { TopBetsResponse } from "./types/responses";
import { setBetslip } from "../features/slice/betting.slice";
import { AppHelper } from "@/utils/helper";
import { states } from "../../../sbamp/generated/prisma/index";

const BetsApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    sports: builder.query<SportsMenuResponse, SportsDto>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_SPORT_TOURNAMENTS, {
          sport_id: data.sport_id || "",
        }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    sportsMenu: builder.query<SportsMenuResponse["sports"], SportMenuDto>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.SPORTS_MENU, {
          period: data.period,
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          timeoffset: data.timeoffset,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
      transformResponse: (response: SportsMenuResponse) => {
        // You can transform the response here if needed
        return Array.isArray(response.sports) ? response.sports : [];
      },
    }),

    sportsCategories: builder.query<
      SportCategoriesResponse,
      SportCategoriesDto
    >({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.SPORT_CATEGORIES, {
          sport_id: data.sport_id,
          period: data.period,
          timeoffset: data.timeoffset,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    tournaments: builder.query<TournamentsResponse, TournamentsDto>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.TOURNAMENTS, {
          category_id: data.category_id,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    queryFixtures: builder.mutation<FixturesResponse, string>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.QUERY_FIXTURES, {
          search: data,
          sport_id: "0",
          upcoming: "1",
          markets: ["1", "10", "18"],
        }),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const fixtures = Array.isArray(data.fixtures)
            ? data.fixtures.map((tem) => ({
                ...tem,
                event_type: "pre",
                status: (tem as any).status ?? 0,
              }))
            : [];
          dispatch(
            setSearchFixtures({
              ...data,
              fixtures: fixtures as unknown as PreMatchFixture[],
            })
          );
        } catch (error) {
          return;
        }
      },
    }),
    fixtures: builder.query<FixturesResponse, FixturesDto>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_FIXTURES, {
          sport_id: data.sport_id ?? "",
          tournament_id: data.tournament_id,
          period: data.period ?? "",
          market_id: data.market_id!,
          specifier: data.specifier,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    fixturesHighlights: builder.query<FixturesResponse, { sport_id: string }>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.SPORTS_HIGHLIGHT, {
          sport_id: data.sport_id || "1",
        }),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const fixtures = Array.isArray(data.fixtures)
            ? data.fixtures.map((tem) => ({
                ...tem,
                event_type: "pre",
                status: (tem as any).status ?? 0,
              }))
            : [];
          dispatch(
            setFixtures({
              ...data,
              fixtures: fixtures as unknown as PreMatchFixture[],
            })
          );
        } catch (error) {
          return;
        }
      },
    }),
    fetchFixtures: builder.query<FixturesResponse, FixturesDto>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.FETCH_FIXTURES, {
          tournament_id: data.tournament_id,
          sport_id: data.sport_id ?? "",
          period: data.period ?? "",
          markets: data.markets!.join(","),
          specifier: data.specifier,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const fixtures = Array.isArray(data.fixtures)
            ? data.fixtures.map((tem) => ({
                ...tem,
                event_type: "pre",
                status: (tem as any).status ?? 0,
              }))
            : [];
          dispatch(
            setFixtures({
              ...data,
              fixtures: fixtures as unknown as PreMatchFixture[],
            })
          );
        } catch (error) {
          return;
        }
      },
    }),

    fetchFixture: builder.mutation<FetchFixtureResponse, FixturesDto>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_FIXTURE, {
          tournament_id: data.tournament_id,
          sport_id: data.sport_id ?? "",
          period: data.period ?? "",
          market_id: data.markets,
          specifier: data.specifier,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
    }),
    getFixture: builder.query<FixtureResponse, FixturesDto>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_FIXTURE, {
          tournament_id: data.tournament_id,
          sport_id: data.sport_id ?? "",
          period: data.period ?? "",
          markets: data.markets,
          specifier: data.specifier,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setSelectedGame(data as unknown as PreMatchFixture));
          }
        } catch (error) {
          console.error("Error fetching fixture:", error);
        }
      },
    }),
    findBet: builder.mutation<FindBetResponse, FindBetDto>({
      query: (data) => ({
        url: BETTING_ACTIONS.FIND_BET,
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
      // onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
      //   try {
      //     const { data } = await queryFulfilled;
      //     // You can dispatch actions here if needed
      //   } catch (error) {
      //     console.error("Error finding bet:", error);
      //   }
      // },
    }),
    findCoupon: builder.mutation<FindCouponResponse, FindBetDto>({
      query: (data) => ({
        url: BETTING_ACTIONS.FIND_COUPON,
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),
    placeBet: builder.mutation<{ success: boolean; data: any }, PlaceBetDto>({
      query: ({ clientId, ...data }) => ({
        url: BETTING_ACTIONS.PLACE_BET.replace(":client_id", String(clientId)),
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),
    bookBet: builder.mutation<{ success: boolean; data: any }, PlaceBetDto>({
      query: ({ clientId, ...data }) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.BOOK_BET, {}),
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),
    fetchTransactions: builder.query<
      GetTransactionsResponse,
      GetTransactionsDto
    >({
      query: (data) => ({
        url: `${BETTING_ACTIONS.GET_TRANSACTIONS}`,
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),
    fetchBetList: builder.query<GetBetListResponse, GetBetListDto>({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_BET_LIST, {
          page: data.p,
          limit: "",
        }).replace(":client_id", String(data.clientId)),
        method: REQUEST_ACTIONS.POST,
        body: data,
      }),
    }),
    fetchBetHistory: builder.query<
      GetBetHistoryResponse,
      {
        page: number;
        clientId: number;
        userId: number;
        status: string | number;
      }
    >({
      query: ({ page, ...body }) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_BET_HISTORY, {
          page: page,
        }),
        method: REQUEST_ACTIONS.POST,
        body,
      }),
    }),
    sportsHighlightLive: builder.query<
      SportsHighlightResponse,
      {
        sport_id: string;
        markets: string;
      }
    >({
      query: (data) => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.SPORTS_HIGHLIGHT_LIVE, {
          sport_id: data.sport_id,
          markets: data.markets,
        }),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          // const liveFixtures: LiveFixture[] =
          //   data.fixtures?.map((liveFixture) => ({
          //     tournament: liveFixture.tournament,
          //     sportID: liveFixture.sportID,
          //     gameID: liveFixture.gameID,
          //     name: liveFixture.name,
          //     matchID: liveFixture.matchID,
          //     date: liveFixture.date,
          //     activeMarkets: liveFixture.activeMarkets || 0,
          //     tournamentID: liveFixture.tournamentID,
          //     categoryID: liveFixture.categoryID,
          //     categoryName: liveFixture.categoryName,
          //     event_type: "live",
          //     eventTime:
          //       liveFixture.eventTime === "--:--"
          //         ? "Live"
          //         : `${liveFixture.eventTime} ⚡`,
          //     homeScore: liveFixture.homeScore,
          //     matchStatus: liveFixture.matchStatus,
          //     status: 0,
          //     awayScore: liveFixture.awayScore,
          //     homeTeam: liveFixture.homeTeam,
          //     competitor1: liveFixture.homeTeam,
          //     homeTeamID: liveFixture.homeTeamID || 0,
          //     awayTeam: liveFixture.awayTeam,
          //     competitor2: liveFixture.awayTeam,
          //     awayTeamID: liveFixture.awayTeamID || 0,
          //     sportName: liveFixture.sportName,
          //     outcomes: liveFixture.outcomes.map((outcome) => ({
          //       marketName: "",
          //       outcomeName: outcome.outcomeName,
          //       specifier: outcome.specifier,
          //       outcomeID: outcome.outcomeID,
          //       odds: outcome.odds,
          //       oddID: outcome.oddID,
          //       status: outcome.status,
          //       active: outcome.active,
          //       producerID: outcome.producerID,
          //       marketID: outcome.marketID,
          //       producerStatus: outcome.producerStatus,
          //       displayName: outcome.displayName || outcome.outcomeName,
          //     })),
          //   })) || [];
          const liveFixtures: LiveFixture[] =
            data.fixtures?.map((liveFixture) => ({
              tournament: liveFixture.tournament,
              sportID: liveFixture.sportID,
              gameID: liveFixture.gameID,
              name: liveFixture.name,
              matchID: liveFixture.matchID,
              date: liveFixture.date,
              activeMarkets: liveFixture.activeMarkets || 0,
              tournamentID: liveFixture.tournamentID,
              categoryID: liveFixture.categoryID,
              categoryName: liveFixture.categoryName,
              event_type: "live",
              eventTime:
                liveFixture.eventTime === "--:--"
                  ? "Live"
                  : `${liveFixture.eventTime}`,
              homeScore: liveFixture.homeScore,
              matchStatus: liveFixture.matchStatus,
              status: 0,
              awayScore: liveFixture.awayScore,
              homeTeam: liveFixture.homeTeam,
              competitor1: liveFixture.homeTeam,
              homeTeamID: liveFixture.homeTeamID || 0,
              awayTeam: liveFixture.awayTeam,
              competitor2: liveFixture.awayTeam,
              awayTeamID: liveFixture.awayTeamID || 0,
              sportName: liveFixture.sportName,
              outcomes: liveFixture.outcomes.map((outcome) => ({
                marketName: "",
                outcomeName: outcome.outcomeName,
                specifier: outcome.specifier,
                outcomeID: outcome.outcomeID,
                odds: outcome.odds,
                oddID: outcome.oddID,
                status: outcome.status,
                active: outcome.active,
                producerID: outcome.producerID,
                marketID: outcome.marketID,
                producerStatus: outcome.producerStatus,
                displayName: outcome.displayName || outcome.outcomeName,
                marketId: outcome.marketID, // Add this line to satisfy the Outcome type
              })),
            })) || [];
          dispatch(
            setLiveFixtures({
              live_fixtures: liveFixtures,
              markets: data.markets || [],
            })
          );
        } catch (error) {
          console.warn("Live fixtures fetch failed:", {
            status: error?.error?.status,
            message: error?.error?.data?.message || "Server error",
          });
          // console.error("Error processing live fixtures:", error);
        }
      },
    }),
    topBets: builder.query<TopBetsResponse["data"], void>({
      query: () => ({
        url: AppHelper.buildQueryUrl(BETTING_ACTIONS.TOP_BETS, {}),
        method: REQUEST_ACTIONS.GET,
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setTopBets(data));
        } catch (error) {
          return;
        }
      },

      transformResponse: (response: TopBetsResponse) => {
        return Array.isArray(response.data) ? response.data : [];
      },
    }),
    // Live betting endpoints
    // getLiveEvents: builder.query<any, { sport_id?: string; status?: string }>({
    //   query: (data) => ({
    //     url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_LIVE_EVENTS, {
    //       sport_id: data.sport_id || "",
    //       status: data.status || "live",
    //     }),
    //     method: REQUEST_ACTIONS.GET,
    //   }),
    // }),

    // getLiveEventDetails: builder.query<any, { event_id: string }>({
    //   query: (data) => ({
    //     url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_LIVE_EVENT_DETAILS, {
    //       event_id: data.event_id,
    //     }),
    //     method: REQUEST_ACTIONS.GET,
    //   }),
    // }),

    // getLiveMarkets: builder.query<
    //   any,
    //   { event_id: string; market_ids?: string[] }
    // >({
    //   query: (data) => ({
    //     url: AppHelper.buildQueryUrl(BETTING_ACTIONS.GET_LIVE_MARKETS, {
    //       event_id: data.event_id,
    //       market_ids: data.market_ids?.join(",") || "",
    //     }),
    //     method: REQUEST_ACTIONS.GET,
    //   }),
    // }),

    // subscribeToLiveEvent: builder.mutation<any, { event_id: string }>({
    //   query: (data) => ({
    //     url: BETTING_ACTIONS.SUBSCRIBE_LIVE_EVENT,
    //     method: REQUEST_ACTIONS.POST,
    //     body: data,
    //   }),
    // }),

    // unsubscribeFromLiveEvent: builder.mutation<any, { event_id: string }>({
    //   query: (data) => ({
    //     url: BETTING_ACTIONS.UNSUBSCRIBE_LIVE_EVENT,
    //     method: REQUEST_ACTIONS.POST,
    //     body: data,
    //   }),
    // }),
  }),
});

export const {
  useSportsMenuQuery,
  useSportsCategoriesQuery,
  useTournamentsQuery,
  useFixturesQuery,
  useLazyFixturesQuery,
  useLazyGetFixtureQuery,
  useFindBetMutation,
  useFindCouponMutation,
  usePlaceBetMutation,
  useBookBetMutation,
  useLazyFetchTransactionsQuery,
  useFetchBetHistoryQuery,
  useLazyFetchBetListQuery,
  useLazyFetchBetHistoryQuery,
  useSportsHighlightLiveQuery,
  useLazySportsHighlightLiveQuery,
  useFetchFixtureMutation,
  useGetFixtureQuery,
  useQueryFixturesMutation,
  useSportsQuery,
  useTopBetsQuery,
  useFetchFixturesQuery,
  useFixturesHighlightsQuery,
} = BetsApiSlice;
