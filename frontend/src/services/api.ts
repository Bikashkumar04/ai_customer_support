import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.trim()) return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0] as { msg?: unknown };
      if (typeof firstError.msg === "string") return firstError.msg;
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ai_support_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ai_support_token");
      localStorage.removeItem("ai_support_user");
      localStorage.removeItem("ai_support_refresh_token");
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);
