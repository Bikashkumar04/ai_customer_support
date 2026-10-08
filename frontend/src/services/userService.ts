import { api } from "./api";
import type { ProfileUpdatePayload, User } from "../types/auth";

export const userService = {
  getCurrentUser: async () => {
    const response = await api.get<User>("/api/v1/users/me");
    return response.data;
  },

  updateCurrentUser: async (payload: ProfileUpdatePayload) => {
    const response = await api.patch<User>("/api/v1/users/me", payload);
    return response.data;
  },
};
