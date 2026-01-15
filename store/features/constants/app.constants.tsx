import { AppState } from "../types/app.types";

export const InitialAppState: AppState = {
  tournament_details: {
    sport_id: null,
    category_id: null,
    tournament_id: null,
    query: "",
  },
  global_variables: null,
  app_refresh: 0,
  tab_name: "",
  az_menu: {
    sport_id: "",
    sport_name: "",
  },
};
