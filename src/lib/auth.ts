import { browser } from "$app/environment";

const JWT_STORAGE_KEY = "convex-jwt-token";
const REFRESH_TOKEN_STORAGE_KEY = "convex-refresh-token";

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export const getStoredToken = (): string | null => {
  if (!browser) return null;
  return sessionStorage.getItem(JWT_STORAGE_KEY);
};

export const setTokens = (tokens: AuthTokens | null) => {
  if (!browser) return;

  if (tokens) {
    sessionStorage.setItem(JWT_STORAGE_KEY, tokens.token);
    sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
  } else {
    sessionStorage.removeItem(JWT_STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
};

export const getRefreshToken = (): string | null => {
  if (!browser) return null;
  return sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

export const clearTokens = () => {
  setTokens(null);
};
