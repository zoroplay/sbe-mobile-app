import { BetSlip } from "./betting.types";

export interface GetTransactionsDto {
  clientId: string;
  endDate: string;
  startDate: string;
  page: number;
}
export interface GetBetListDto {
  betslipId: string;
  clientId: string;
  from: string;
  p: number;
  status: string;
  to: string;
  userId: number;
}

export interface GetTransactionsResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    referenceNo: string;
    amount: number;
    balance: number;
    subject: string;
    type: string;
    description: string;
    transactionDate: string;
    channel: string;
    status: number;
    wallet: string;
  }[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    lastPage: number;
    nextPage: number;
    prevPage: number;
  };
}

export interface GetBetListResponse {
  success: boolean;
  message: string;
  data: {
    tickets: BetSlip[];
    totalSales: string;
    totalWon: string | null;
    totalCancelled: number;
    totalSalesNo: number;
    totalCancelledNo: number;
    totalWonNo: number;
    totalRunningNo: number;
    meta: {
      page: number;
      perPage: number;
      total: number;
      lastPage: number | null;
      nextPage: number;
      prevPage: number;
    };
  };
}

export interface BetHistorySelection {
  eventName: string;
  eventType: string;
  eventId: number;
  marketName: string;
  specifier: string;
  outcomeName: string;
  odds: number;
  sportId: number;
  status: string;
  statusDescription: string;
  type: string;
  sport: string;
  tournament: string;
  category: string;
  matchId: string;
  eventDate: string;
  eventPrefix: string;
  id: number;
  score?: string;
}

export interface BetHistoryBet {
  selections: BetHistorySelection[];
  stake: number;
  created: string;
  statusCode: number;
  cashOutAmount: number;
  statusDescription: string;
  source: string;
  totalOdd: number;
  possibleWin: number;
  betType: number;
  betslipId: string;
  totalSelections: number;
  betCategory: string;
  id: number;
  userId: number;
  username: string;
  eventType: string;
  sports: string;
  tournaments: string;
  events: string;
  markets: string;
  betCategoryDesc: string;
  isBonusBet: boolean;
  pendingGames: number;
  isSim: boolean;
  winnings?: number;
  minStake?: number;
  minOdd?: number;
  systemBets?: any[];
}

export interface GetBetHistoryResponse {
  // success: boolean;
  // message: string;
  // data: {
  bets: BetHistoryBet[];
  from: number;
  to: number;
  remainingRecords: number;
  totalRecords: number;
  totalStake: number;
  // };
}
