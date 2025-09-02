import { writable, derived } from "svelte/store";
import { setTokens, getStoredToken } from "../auth.js";
import {
  storeDeviceFingerprint,
  validateDeviceFingerprint,
  logSecurityEvent,
  secureLogout,
} from "../utils/security.js";
import type { AuthTokens } from "../types/index.js";
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
        // Validate device fingerprint for security
        if (!validateDeviceFingerprint()) {
          logSecurityEvent("device_mismatch", {
            reason: "fingerprint_changed",
          });
          // For now, just log - don't force logout to avoid UX disruption
          // In future versions, consider requiring re-authentication
        }

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

      // Store device fingerprint on successful auth
      storeDeviceFingerprint();

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
      // Use secure logout that clears all security-related data
      secureLogout();
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
