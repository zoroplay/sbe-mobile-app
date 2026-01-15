import { PreMatchFixture } from "@/store/features/types/fixtures.types";
import {
  Sport,
  SportCategory,
  Tournament,
  SelectedMarket,
  Market,
  OutcomeType,
} from "../../../data/types/betting.types";
import { Fixture } from "../types/responses";

export interface SportsDto {
  sport_id: string;
}
export interface SportMenuDto {
  period: string;
  start_date?: string | null;
  end_date?: string | null;
  timeoffset: string;
}

export interface FixturesDto {
  tournament_id: string;
  sport_id: string;
  period: string;
  market_id?: string;
  markets?: string[];
  specifier: string;
}

export interface FindBetDto {
  betslipId: string;
  clientId: string;
}

export interface SportCategoriesDto {
  sport_id: string;
  period: string;
  // timeoffset: string;
}

export interface TournamentsDto {
  category_id: string;
  period: string;
  timeoffset: string;
  total: string;
}

export interface SportsMenuResponse {
  sports: Sport[];
}

export interface SportCategoriesResponse {
  sports: SportCategory[];
}

export interface TournamentsResponse {
  sports: Tournament[];
}

export interface FixturesResponse {
  fixtures: Fixture[];
  selectedMarket: SelectedMarket[];
  markets: Market[];
  outcomeTypes: OutcomeType[];
}
export interface FixtureResponse extends Fixture {}
export interface FetchFixtureResponse extends PreMatchFixture {
  data: PreMatchFixture;
}

export interface PlaceBetDto {
  clientId: number;
  bet_type: string;
  betslip_type: string;
  channel: string;
  combos: Array<{
    Grouping: number;
    Combinations: number;
    StakeForCombination: number;
    MinPercentageBonus: number;
    MaxPercentageBonus: number;
    MinWinForUnit: number;
    MaxWinForUnit: number;
    MinBonusForUnit: number;
    MaxBonusForUnit: number;
  }>;
  event_type: string;
  exciseDuty: number;
  fixtures: Array<{
    eventName: string;
    eventId: number;
    type: string;
    started: string;
    selections: Array<{
      matchId: number;
      eventId: number;
      gameId: number;
      eventName: string;
      marketId: number;
      marketName: string;
      specifier: string;
      outcomeName: string;
      displayName: string;
      outcomeId: string;
      odds: string;
      eventDate: string;
      tournament: string;
      category: string;
      sport: string;
      sportId: string;
      type: string;
      fixed: boolean;
      combinability: number;
      selectionId: string;
      element_id: string;
      homeTeam: string;
      awayTeam: string;
      producerId: number;
      stake: number;
    }>;
  }>;
  grossWin: number;
  isBooking: number;
  maxBonus: number;
  maxOdds: number;
  maxWin: string;
  minBonus: number;
  minOdds: number;
  minWin: number;
  selections: Array<{
    matchId: number;
    eventId: number;
    gameId: number;
    eventName: string;
    marketId: number;
    marketName: string;
    specifier: string;
    outcomeName: string;
    displayName: string;
    outcomeId: string;
    odds: string;
    eventDate: string;
    tournament: string;
    category: string;
    sport: string;
    sportId: string;
    type: string;
    fixed: boolean;
    combinability: number;
    selectionId: string;
    element_id: string;
    homeTeam: string;
    awayTeam: string;
    producerId: number;
    stake: number;
  }>;
  source: string;
  stake: string;
  totalOdds: number;
  totalOdd: string;
  totalStake: number;
  tournaments: Array<{
    tournamentName: string;
    category: string;
    combinability: number;
    events: Array<{
      matchId: number;
      eventId: number;
      gameId: number;
      eventName: string;
      marketId: number;
      marketName: string;
      specifier: string;
      outcomeName: string;
      displayName: string;
      outcomeId: string;
      odds: string;
      eventDate: string;
      tournament: string;
      category: string;
      sport: string;
      sportId: string;
      type: string;
      fixed: boolean;
      combinability: number;
      selectionId: string;
      element_id: string;
      homeTeam: string;
      awayTeam: string;
      producerId: number;
      stake: number;
    }>;
  }>;
  userId: number;
  userRole: string;
  username: string;
  wthTax: number;
}

export interface FindBetSelection {
  eventName: string;
  eventId: string;
  eventPrefix: string;
  eventDate: string;
  eventType: string;
  matchId: string;
  producerId: number;
  marketId: number;
  marketName: string;
  specifier: string;
  outcomeId: string;
  outcomeName: string;
  odds: string;
  sport: string;
  sportId: string;
  category: string;
  tournament: string;
  selectionId: string;
  id: string;
}
export interface BetSlip {
  id: string;
  user_id: string;
  username: string;
  betslip_id: string;
  stake: string;
  bet_category: string;
  bet_category_desc: string;
  total_odd: string;
  possible_win: string;
  total_bets: number;
  status: number;
  sports: string;
  tournaments: string;
  events: string;
  created: string;
  statusCode: number;
  selections: {
    eventName: string;
    eventDate: string;
    eventType: string;
    eventPrefix: string;
    eventId: string;
    matchId: string;
    marketName: string;
    specifier: string;
    outcomeName: string;
    odds: string;
    sport: string;
    category: string;
    tournament: string;
    type: string;
    statusDescription: string;
    status: number;
    score: string | null;
    htScore: string | null;
    [x: string]: string | number | null;
  }[];
  userId: string;
  betslipId: string;
  totalOdd: string;
  possibleWin: string;
  betCategory: string;
  totalSelections: number;
  betCategoryDesc: string;
  cashOutAmount: number;
  paid_out: number;
  pendingGames: string;
}

export interface FindBetData {
  stake: string;
  betslipId: string;
  totalOdd: string;
  possibleWin: string;
  paidOut: number;
  paidAt: string | null;
  source: string;
  selections: FindBetSelection[];
}

export interface FindBetResponse {
  success: boolean;
  message: string;
  data: FindBetData;
}

export interface FindCouponSelection {
  eventName: string;
  eventDate: string;
  eventType: string;
  eventPrefix: string;
  eventId: string;
  matchId: string;
  marketName: string;
  specifier: string;
  outcomeName: string;
  odds: string;
  sport: string;
  sportId: string;
  category: string;
  tournament: string;
  type: string;
  statusDescription: string;
  status: number;
  score: string | null;
  htScore: string | null;
  id: string;
}

export interface FindCouponData {
  selections: FindCouponSelection[];
  statusDescription: string;
  statusCode: number;
  id: string;
  stake: string;
  created: string;
  userId: string;
  username: string;
  betslipId: string;
  totalOdd: string;
  possibleWin: string;
  betType: string;
  betCategory: string;
  totalSelections: number;
  winnings: string | null;
  source: string;
  cashOutAmount: number;
}

export interface FindCouponResponse {
  success: boolean;
  message: string;
  data: FindCouponData;
}

export interface SportsHighlightOutcome {
  outcomeName: string;
  specifier: string;
  outcomeID: string;
  odds: number;
  oddID: number;
  status: number;
  active: number;
  producerID: number;
  marketID: number;
  marketId: number;
  producerStatus: number;
  displayName?: string;
}

export interface SportsHighlightFixture {
  tournament: string;
  sportID: string;
  gameID: string;
  name: string;
  matchID: string;
  date: string;
  activeMarkets: number;
  tournamentID: number;
  categoryID: string;
  categoryName: string;
  eventTime: string;
  homeScore: string;
  matchStatus: string;
  awayScore: string;
  homeTeam: string;
  homeTeamID: number;
  awayTeam: string;
  awayTeamID: number;
  sportName: string;
  outcomes: SportsHighlightOutcome[];
}

export interface SportsHighlightMarketOutcome {
  outcomeID: number;
  outcomeName?: string;
}

export interface SportsHighlightMarket {
  marketID: string;
  marketName: string;
  specifier: string;
  outcomes: SportsHighlightMarketOutcome[];
  sportID: number;
}

export interface SportsHighlightResponse {
  fixtures: SportsHighlightFixture[];
  lastPage: number;
  from: number;
  to: number;
  remainingRecords: number;
  markets: Market[];
  // markets: SportsHighlightMarket[];
}

// Live Betting WebSocket Types
export interface LiveBettingMessage {
  message_type: "odds_change" | "bet_stop" | "fixture_change" | "bet_cancel";

  timestamp: number;
  event_id?: number;
  event_type?: string;
  event_prefix?: string;
  product?: number;
  odds_change_reason?: string;
  sport_event_status?: SportEventStatus;
  odds?: OddsData;
  markets?: LiveMarket[];
  producer_status?: ProducerStatus;
  // bet_stop specific attributes
  match_id?: number;
  groups?: string[];
  market_status?: number;
  betstop_reason?: string;

  // fixture_change specific attributes
  change_type?: number;
  // Additional Unified Feed fields
  betting_status?: string;
}

export interface SportEventStatus {
  status: number;
  match_status: number;
  home_score: number;
  away_score: number;
  clock?: {
    stopped: boolean;
    match_time: string;
    remaining_time: string;
  };
}

export interface OddsData {
  betstop_reason?: string;
  betting_status?: string;
  markets: LiveMarket[];
}

export interface LiveMarket {
  id: number;
  specifiers?: string;
  market_url?: string;
  status: number; // 0=active, 1=suspended, 2=deactivated, 3=settled, 4=cancelled, 5=handed_over
  favourite?: number;
  market_metadata?: MarketMetadata;
  extended_specifiers?: string;
  outcomes?: LiveOutcome[];
  outcome?: LiveOutcome[]; // Alternative field name from Unified Feed
}

export interface MarketMetadata {
  next_betstop?: number;
}

export interface LiveOutcome {
  id: string;
  name: string;
  odds: number;
  active: boolean;
  probability?: number;
  status?: number;
  producer_status?: number;
}

export interface ProducerStatus {
  producer_id: number;
  producer_name: string;
  status: "up" | "down" | "maintenance";
  last_update: number;
}

export interface LiveBettingState {
  is_connected: boolean;
  is_loading: boolean;
  error: string | null;
  last_message_time: number;
  active_events: Record<number, LiveEventData>;
  market_status: Record<string, number>; // market_id -> status
  producer_status: Record<number, ProducerStatus>;
}

export interface LiveEventData {
  event_id: number;
  event_type: string;
  event_prefix: string;
  sport_event_status: SportEventStatus;
  markets: Record<number, LiveMarket>;
  last_updated: number;
}

export interface LiveBettingConnectionConfig {
  url: string;
  reconnect_interval: number;
  max_reconnect_attempts: number;
  heartbeat_interval: number;
}

// Bet Cancel Types
export interface BetCancelMarket {
  id: number;
  specifier?: string;
}

export interface BetCancelMessage extends LiveBettingMessage {
  message_type: "bet_cancel";
  match_id: number;
  event: string;
  markets: LiveMarket[];
  start_time?: number;
  end_time?: number;
  superceded_by?: string;
}

// Bet Stop Types
export interface BetStopMessage extends LiveBettingMessage {
  message_type: "bet_stop";
  match_id: number;
  event_id: number;
  groups: string[]; // ["all"] or specific group names
  market_status?: number; // if not present, move to suspended
  betstop_reason?: string;
}

// Fixture Change Types
export interface FixtureChangeMessage extends LiveBettingMessage {
  message_type: "fixture_change";
  match_id: number;
  event: string;
  change_type?: number; // 1=NEW, 2=DATETIME, 3=CANCELLED, 4=FORMAT, 5=COVERAGE
}

// MQTT Topic Types
export interface MQTTTopicConfig {
  base_topic: string;
  message_types: string[];
  event_types: string[];
  match_ids?: number[];
}

// MTS Integration Types
export interface MTSBet {
  specifier: string;
  sport_id: number;
  outcome_id: string;
  event_id: number;
  event_type: string;
  odds: number;
  event_prefix: string;
  producer_id: number;
  market_id: number;
}

export interface MTSBetRequest {
  stake: number;
  profile_id: number;
  bet_id: string;
  source: number;
  reply_prefix?: string;
  ip_address: string;
  bets: MTSBet[];
}

export interface MTSBetCancelRequest {
  bet_id: string;
  code: number;
  reply_prefix?: string;
}

export interface MTSBetResponse {
  bet_id: string;
  reason?: string;
}

export interface MTSStatus {
  status: "up" | "down" | "maintenance";
  last_update: number;
}
