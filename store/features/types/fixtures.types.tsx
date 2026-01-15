// import {
//   Fixture,
//   Market,
//   OutcomeType,
//   SelectedMarket,
// } from "@/data/types/betting.types";
// import { FindCouponData } from "@/store/services/data/betting.types";

import { TopBetsResponse } from "@/store/services/types/responses";
import type {
  Fixture,
  Market,
  OutcomeType,
  SelectedMarket,
} from "../../../data/types/betting.types";
import type { FindCouponData } from "../../services/data/betting.types";

export interface PreMatchFixture extends Fixture {
  event_type: "pre";
}

export interface FixturesState {
  fixtures: PreMatchFixture[];
  selectedMarket: SelectedMarket[];
  markets: Market[];
  outcomeTypes: OutcomeType[];
  selectedGame: PreMatchFixture | null;
  couponData: FindCouponData | null;
  cashdesk_fixtures: {
    sport_id: number;
    fixtures: PreMatchFixture[];
    selectedMarket: SelectedMarket[];
    is_loading: boolean;
  };
  top_bets: TopBetsResponse["data"];
  sports_page: {
    fixtures: PreMatchFixture[];
    selectedMarket: SelectedMarket[];
    markets: Market[];
    sport_id: number;
    tournament_id: number;
  };
  search: {
    fixtures: PreMatchFixture[];
    selectedMarket: SelectedMarket[];
    markets: Market[];
    search_query: string;
  };
  casino: {
    game_name: string;
    game_id: string;
  };
}
