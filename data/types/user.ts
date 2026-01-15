export interface User {
  id: number;
  username: string;
  balance: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  roleId: number;
  availableBalance: number;
  sportBonusBalance: number;
  casinoBonusBalance: number;
  virtualBonusBalance: number;
  commissionBalance: number;
  trustBalance: number;
  token: string;
  authCode: string;
  country: string;
  currency: string;
  address: string;
  gender: string;
  dateOfBirth: string;
  status: number;
}

export interface UserRole {
  user_id: string;
  role_name: "COMPANY" | "BRANCH_MANAGER" | "STAFF";
  is_active: boolean;

  user: User;
}

// Types for validate user response
export interface UserDetails {
  auth_code: string;
  clientId: number;
  code: string;
  createdAt: string;
  deleted_at: string | null;
  id: number;
  lastLogin: string;
  password: string;
  pin: string | null;
  refreshToken: string;
  registrationSource: string | null;
  role: {
    id: number;
    name: string;
    permissions: string[];
  };
  roleId: number;
  status: number;
  trackierId: string | null;
  trackierToken: string | null;
  updatedAt: string;
  userDetails: {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    gender: string;
    dateOfBirth: string;
    country: string;
    currency: string;
    createdAt: string;
    updatedAt: string;
  };
  username: string;
  verified: number;
  virtualToken: string | null;
}

export interface ValidateUserResponse {
  data: UserDetails;
  message: string;
  status: number;
  success: boolean;
}

export interface ValidateUserApiResponse {
  data: ValidateUserResponse;
  error: undefined;
  status: number;
  timestamp: string;
  url: string;
}
