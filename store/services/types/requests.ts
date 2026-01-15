export interface LoginRequest {
  username: string;
  password: string;
  clientId: number;
}

export interface RegisterRequest {
  // first_name: string;
  // last_name: string;
  // email: string;
  // password: string;
  // phone_number: string;
  username: string;
  password: string;
  clientId: number;
  promoCode: string;
}

export interface SendMessageRequest {
  chat_id: string;
  content: string;
  type: string;
  duration?: number;
}

export interface CommissionRequest {
  userId: number;
  noOfSelections: number;
  provider: string;
  stake: number;
  clientId: number;
  totalOdds: number;
  commissionId: number;
  individualOdds: number[];
  individualEventTypes: string[];
}
export interface PayoutCommissionRequest {
  clientId: number;
  userId: number;
  // commissionId: number;
  amount: number;
  // provider: string;
  betId: string;
}

export interface DepositCommissionRequest {
  clientId: number;
  userId: number;
  commissionId: number;
  amount: number;
  provider: string;
  depositCode: string;
}
export interface BankWithdrawalDto {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  type: string;
  source: string;
  clientId: string;
}
export interface VerifyBankAccountDto {
  accountNumber: string;
  bankCode: string;
}
export interface WithdrawCreateDto {
  withdraw_code: string;
}
export interface WithdrawVerifyDto {
  withdraw_code: string;
}

export interface TransferFundsDto {
  action: string;
  amount: number;
  description: string;
  fromUserId: number;
  fromUsername: string;
  toUserId: number;
  toUsername: string;
  type: string;
}

export interface StartGameRequest {
  gameId: number;
  clientId: number;
  username: string;
  userId: number;
  demo: boolean;
  isMobile: boolean;
  homeUrl: string;
  authCode: string;
  balanceType: string;
}
