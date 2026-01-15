export interface Outcome {
  marketName: string;
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
  displayName: string;
  trend?: string;
}

export interface Fixture {
  tournament: string;
  sportID: string;
  gameID: string;
  name: string;
  matchID: string;
  date: string;
  tournamentID: number;
  categoryID: string;
  categoryName: string;
  eventTime: string;
  homeScore: string;
  matchStatus: string;
  awayScore: string;
  homeTeam: string;
  awayTeam: string;
  sportName: string;
  outcomes: Outcome[];
  status: number;
  competitor1: string;
  competitor2: string;
  activeMarkets: number;
}

export interface SelectedMarketOutcome {
  outcomeID: number;
  outcomeName: string;
}

export interface SelectedMarket {
  marketID: string;
  marketName: string;
  specifier: string;
  outcomes: SelectedMarketOutcome[];
}

export interface Market {
  marketID: string;
  marketName: string;
  specifier: string;
  sportID: number;
  groupID: number;
  status: number;
  outcomes: Outcome[];
}

export interface OutcomeType {
  outcomeID: number;
  marketName: string;
  marketID: string;
  displayName: string;
}

export interface Tournament {
  tournamentID: number;
  tournamentName: string;
  total: number;
}

export interface SportCategory {
  categoryID: string;
  categoryName: string;
  total: number;
  code: string;
}

export interface Sport {
  sportID: string;
  sportName: string;
  total: number;
}
