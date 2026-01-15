import { FixturesState } from "../types/fixtures.types";

export const initialFixturesState: FixturesState = {
  fixtures: [],
  selectedMarket: [],
  markets: [],
  outcomeTypes: [],
  selectedGame: null,
  couponData: null,
  cashdesk_fixtures: {
    sport_id: 0,
    fixtures: [],
    selectedMarket: [],
    is_loading: false,
  },
  top_bets: [],
  sports_page: {
    fixtures: [],
    selectedMarket: [],
    markets: [],
    sport_id: 0,
    tournament_id: 0,
  },
  search: {
    fixtures: [],
    selectedMarket: [],
    markets: [],
    search_query: "",
  },
  casino: {
    game_name: "",
    game_id: "",
  },
};
