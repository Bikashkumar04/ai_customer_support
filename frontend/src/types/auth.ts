export type Role = "CUSTOMER" | "SUPPORT" | "ADMIN";

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type AuthResponse = {
  user: User;
  tokens: AuthTokens;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type ProfileUpdatePayload = Partial<Pick<User, "first_name" | "last_name" | "email">>;
