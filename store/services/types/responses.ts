/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outcome } from "@/data/types/betting.types";
import type { User } from "../../../data/types/user";

export interface ServerGlobalVariablesResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    AllowRegistration: string;
    EnableSplitBet: string;
    EnableSystemBet: string;
    comboMaxStake: string;
    MinBetStake: string;
    comboMinStake: string;
    MaxCombinationOddLength: string;
    CurrencyCode: string;
    Currency: string;
    DialCode: string;
    EnableBankAcct: string;
    enableCashout: string;
    taxEnabled: string;
    exciseTax: string;
    LiabilityThreshold: string;
    LiveTicketMax: string;
    Logo: string;
    MaxPayout: string;
    MinBonusOdd: string;
    MinDeposit: string;
    MinWithdrawal: string;
    PaymentDay: string;
    PowerBonusStartDate: string;
    singleMaxStake: string;
    SingleMaxWinning: string;
    singleMinStake: string;
    SingleTicketLenght: string;
    MaxNoOfSelection: string;
    wthTax: string;
  };
}
export interface AuthResponse {
  status: number;
  success: boolean;
  data: User;
  error: string;
}

export interface TopBetsResponse {
  data: {
    categoryID: number;
    categoryName: string;
    fixtureCount: number;
    id: number;
    sportID: number;
    sportName: string;
    tournamentID: number;
    tournamentName: string;
  }[];
}

export interface CommissionTransactionsResponse {
  success: boolean;
  message: string;
  status: number;
  data: {
    commission_balance: string;
    available_balance: string;
    commission: string;
    balance: string;
    totalSaleTickets: number;
    transactions: Transaction[];
    pagination: Pagination;
  };
}

export interface Transaction {
  type: string;
  bMovement: string;
  cMovement: string;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
}
// Commission Profile interfaces
export interface CommissionProfile {
  id: number;
  name: string;
  isDefault: boolean;
  description: string;
  providerGroup: string;
  period: string;
  calculationType: string;
  percentage: number | null;
  commissionType: number;
  clientId: number;
  createdAt: Record<string, unknown>;
  updatedAt: Record<string, any>;
  paymentDay: string | null;
  livebetTypes: any | null;
}

export interface UserCommissionProfileData {
  id: number;
  provider: string;
  userId: number;
  profileId: number;
  agentId: number | null;
  nextPayDay: string;
  createdAt: Record<string, any>;
  updatedAt: Record<string, any>;
  profile: CommissionProfile;
}

export interface UserCommissionProfileResponse {
  success: boolean;
  message: string;
  data: { data: UserCommissionProfileData };
}

export interface UserCommissionResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    provider: string;
    userId: number;
    profileId: number;
    agentId: null;
    nextPayDay: string;
    createdAt: string;
    updatedAt: string;
    profile: {
      id: number;
      name: string;
      isDefault: false;
      description: string;
      providerGroup: string;
      period: string;
      calculationType: string;
      percentage: number;
      commissionType: number;
      clientId: number;
      createdAt: string;
      updatedAt: string;
    };
  }[];
}

// Sports/Fixtures API interfaces
// export interface Outcome {
//   outcomeName: string;
//   specifier: string;
//   outcomeID: string;
//   odds: number;
//   oddID: number;
//   status: number;
//   active: number;
//   producerID: number;
//   marketID: number;
//   producerStatus: number;
//   displayName: string;
// }

export interface Fixture {
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
  outcomes: Outcome[];
}

export interface FixturesResponse {
  fixtures: Fixture[];
}
export interface PaymentMethod {
  id: number;
  title: string;
  provider: string;
  secretKey?: string;
  publicKey?: string;
  merchantId?: string;
  baseUrl?: string;
  status: number;
  forDisbursement: number;
}

export interface PaymentMethodsResponse {
  success: boolean;
  status: number;
  message: string;
  data: PaymentMethod[];
}

export interface InitializeTransactionDto {
  amount: number;
  paymentMethod: string;
  clientId: string;
}

export interface InitializeTransactionResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    link: string;
    reference?: string;
  };
}

export interface WithdrawVerifyResponse {
  success: boolean;
  status: number;
  message: string;
  balance?: {
    withdrawRequest?: {
      account_holder: string;
      amount: number;
      withdraw_code: string;
    };
    user?: {
      balance: number;
    };
  };
}

export interface WithdrawCreateResponse {
  success: boolean;
  status: number;
  message: string;
  balance?: any;
}

export interface PendingWithdrawal {
  id: number;
  code: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
}

export interface PendingWithdrawalsResponse {
  success: boolean;
  status: number;
  message: string;
  data: PendingWithdrawal[];
}

export interface Bank {
  id: string;
  bank_id: string;
  name: string;
  slug: string;
  code: string;
  long_code: string;
  country: string;
  currency: string;
  type: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface GetBanksResponse {
  success: boolean;
  status: number;
  message: string;
  data: Bank[];
}

export interface VerifyBankAccountResponse {
  success: boolean;
  status: number;
  message: string; // This contains the account name
}

export interface BankWithdrawalResponse {
  success: boolean;
  status: number;
  message: string;
  data?: any;
}
export interface TransferFundsResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    balance: number;
  };
}
export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface Game {
  id: number;
  gameId: string;
  title: string;
  description: string;
  url: string | null;
  imagePath: string;
  bannerPath: string;
  status: boolean;
  type: GameType;
  game_category_w: string | null;
  game_category_m: string | null;
  priority: number;
  createdAt: Record<string, unknown>;
  updatedAt: Record<string, unknown>;
  provider: Provider;
  categories: GameCategory[];
}
export type GameType =
  | "CASINO/CRASH"
  | "CASINO/SLOT/1REEL"
  | "CASINO/SLOT/3REEL"
  | "CASINO/SLOT/5REEL"
  | "CASINO/SLOT/6REEL"
  | "CASINO/TABLEGAME/ROULETTE"
  | "CASINO/LIVECASINO/WHEEL_OF_FORTUNE";

export interface GameCategory {
  id: number;
  client_id: number;
  name: string;
  slug: string;
  priority: number;
  status: "active" | "inactive";
  created_at: Record<string, unknown>;
  updated_at: Record<string, unknown>;
}

export interface Provider {
  id: number;
  slug: string;
  name: string;
  description: string;
  status: number;
  imagePath: string;
  parentProvider: string;
  createdAt: Record<string, unknown>;
  updatedAt: Record<string, unknown>;
}

export interface ProvidersResponse {
  [key: string]: Provider;
}
