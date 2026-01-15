// import { User } from "@/data/types/user";

import type { User } from "../../../data/types/user";

export const UserRoles = ["COMPANY", "BRANCH_MANAGER", "STAFF"] as const;
export type UserRole = (typeof UserRoles)[number];

export interface UserState {
  is_authenticated: boolean;
  role: UserRole;
  refetch_user: number;
  user: User | null;
  last_request_time: number | null;
  user_rerender: number;
}
