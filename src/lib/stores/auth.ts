import { writable, derived } from "svelte/store";
import {
  setTokens,
  clearTokens,
  getStoredToken,
  type AuthTokens,
} from "../auth.js";
import { formatUserName } from "../utils/user.js";

import type { User, AuthState } from "$lib/types/stores";

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  });

  return {
    subscribe,

    checkExistingAuth() {
      const token = getStoredToken();
      if (token) {
        update((state) => ({
          ...state,
          isAuthenticated: true,
          isLoading: true,
        }));
        return true;
      }
      return false;
    },

    setUser(userData: User | null) {
      update((state) => ({
        ...state,
        user: userData,
        isLoading: false,
        error: null,
      }));
    },

    setAuthSuccess(userData: User, tokens: AuthTokens) {
      setTokens(tokens);
      update((state) => ({
        ...state,
        isAuthenticated: true,
        user: userData,
        isLoading: false,
        error: null,
      }));
    },

    setAuthError(error: string) {
      update((state) => ({
        ...state,
        isLoading: false,
        error,
      }));
    },

    setLoading(loading: boolean) {
      update((state) => ({ ...state, isLoading: loading }));
    },

    signOut() {
      clearTokens();
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    },

    clearError() {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const authStore = createAuthStore();

// Derived stores for convenience
export const isAuthenticated = derived(
  authStore,
  ($auth) => $auth.isAuthenticated,
);
export const currentUser = derived(authStore, ($auth) => $auth.user);
export const userDisplayName = derived(currentUser, ($user) =>
  formatUserName($user),
);
