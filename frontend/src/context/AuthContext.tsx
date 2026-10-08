import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authService } from "../services/authService";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth";

const TOKEN_KEY = "ai_support_token";
const REFRESH_TOKEN_KEY = "ai_support_refresh_token";
const USER_KEY = "ai_support_user";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setSession: (response: AuthResponse) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const setSession = useCallback((response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.tokens.refresh_token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const refreshUser = useCallback(async () => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (!savedUser) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } catch {
      clearSession();
    }
  }, [clearSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    setSession(response);
  }, [setSession]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload);
    setSession(response);
  }, [setSession]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout failures so the user is still signed out locally.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (!token || !savedUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setUser(parsedUser);
        await refreshUser();
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    void initializeAuth();
  }, [clearSession, refreshUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
      refreshUser,
      setSession,
    }),
    [loading, login, logout, refreshUser, register, setSession, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
