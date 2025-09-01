import { browser } from "$app/environment";
import { getStoredToken } from "./auth.js";
import type { ConvexClient } from "convex/browser";

// Get auth token from Convex Auth
export function getConvexAuthToken(): string | null {
  if (!browser) return null;

  // Use the same storage key as the auth store
  return getStoredToken();
}

// Set up Convex client with proper auth
export function setupConvexAuth(convex: ConvexClient) {
  if (!browser || !convex) return;

  const token = getConvexAuthToken();
  if (token) {
    convex.setAuth(() => Promise.resolve(token));
  }
}

// Update Convex client auth token (call this when tokens change)
export function updateConvexAuth(convex: ConvexClient, token: string) {
  if (!browser || !convex) return;

  convex.setAuth(() => Promise.resolve(token));
}
