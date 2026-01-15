import { UserState } from "../types/user.types";

export const initialState: UserState = {
  refetch_user: 0,
  is_authenticated: false,
  role: "BRANCH_MANAGER",
  user: null,
  last_request_time: null,
  user_rerender: 0,
};
