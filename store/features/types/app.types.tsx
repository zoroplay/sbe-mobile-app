export interface GlobalVariables {
  allow_registeration: string;
  enable_split_bet: string;
  enable_system_bet: string;
  combo_max_style: string;
  min_bet_stake: string;
  combo_min_stake: string;
  max_combination_odd_length: string;
  currency_code: string;
  currency: string;
  dial_code: string;
  enable_bank_acct: string;
  enable_cashout: string;
  tax_enabled: string;
  excise_tax: string;
  liability_threshold: string;
  live_ticket_max: string;
  logo: string;
  max_payout: string;
  min_bonus_odd: string;
  min_deposit: string;
  min_withdrawal: string;
  payment_day: string;
  power_bonus_start_date: string;
  single_max_stake: string;
  single_max_winning: string;
  single_min_stake: string;
  single_ticket_length: string;
  max_no_of_selection: string;
  wth_tax: string;
}
export interface AppState {
  tournament_details: {
    sport_id: number | null;
    category_id: number | null;
    tournament_id: number | null;
    query: string;
  };
  global_variables: GlobalVariables | null;
  app_refresh: number;
  tab_name: string;
  az_menu: {
    sport_id: string;
    sport_name: string;
  };
}
