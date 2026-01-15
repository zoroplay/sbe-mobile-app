export enum AUTH {
  HOME = "/auth",
  SIGN_IN = "/auth/sign-in",
  SIGN_UP = "/auth/sign-up",
}

export enum LANDING {
  HOME = "/",
}

export enum OVERVIEW {
  HOME = "/",
  LOAD_BETS = "/load-bets",
  COMMISSION = "/commission",
  TRANSACTIONS = "/transactions",
  CASHDESK = "/cashdesk",
  LIVE = "/live",
  SPORTS = "/sports", // Base sports page (all sports)
  SPORTS_BY_ID = "/sports/:sport_id", // Dynamic sport-specific pages
  BET_LIST = "/bet-list",
}

export enum ACCOUNT {
  HOME = `/account`,
  BET_LIST = `/account/bet-list`,
  BET_LIST_PAYOUT = `/account/bet-list-payout`,
  COUPON_BET_LIST = `/account/coupon-bet-list`,
  TRANSACTIONS = `/account/transactions`,
  ONLINE_REPORT = `/account/online-report`,
  DEPOSIT = `/account/deposit`,
  DEPOSIT_FORM = `/account/deposit/:provider`,
  WITHDRAW = `/account/withdraw`,

  // POS Section
  NEW_USER = `/account/new-user`,
  USER_LIST = `/account/user-list`,
  TRANSFER_TO_CASHIER = `/account/transfer-to-cashier`,
  TRANSFER_TO_PLAYER = `/account/transfer-to-player`,

  // Reports Section
  COMMISSIONS = `/account/commissions`,
  SALES = `/account/sales`,
  BONUS = `/account/bonus`,
  CREDIT_LIABILITY = `/account/credit-liability`,

  // Settings Section
  PROFILE = `/account/profile`,
  ACCOUNT_DETAIL = `/account/account-detail`,
  CHANGE_PASSWORD = `/account/change-password`,
  PERSONAL_DATA = `/account/personal-data`,
  VIEW_SESSION = `/account/view-session`,
}

export enum CALENDAR {
  HOME = "/(overview)/(calendar)",
  EVENTS = "/(overview)/(calendar)/(events)",
}
