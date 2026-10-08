import { api } from "./api";
import type { AuthResponse, User } from "../types/auth";

export const authService = {
  register: async (payload: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post<AuthResponse>("/api/v1/auth/register", payload);
    return response.data;
  },

  login: async (payload: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>("/api/v1/auth/login", payload);
    return response.data;
  },

  logout: async (refreshToken: string) => {
    await api.post("/api/v1/auth/logout", { refresh_token: refreshToken });
  },

  getCurrentUser: async () => {
    const response = await api.get<User>("/api/v1/users/me");
    return response.data;
  },
};
