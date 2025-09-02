import { browser } from "$app/environment";
import type { AuthTokens } from "./types/index.js";

const JWT_STORAGE_KEY = "convex-jwt-token";
const REFRESH_TOKEN_STORAGE_KEY = "convex-refresh-token";

export const getStoredToken = (): string | null => {
  if (!browser) return null;
  return localStorage.getItem(JWT_STORAGE_KEY);
};

export const setTokens = (tokens: AuthTokens | null) => {
  if (!browser) return;

  if (tokens) {
    localStorage.setItem(JWT_STORAGE_KEY, tokens.token);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  } else {
    localStorage.removeItem(JWT_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
};

export const getRefreshToken = (): string | null => {
  if (!browser) return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

export const clearTokens = () => {
  setTokens(null);
};
