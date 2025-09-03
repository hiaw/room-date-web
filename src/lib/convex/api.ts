// Client-side only Convex API loader
// This file acts as a proxy to avoid SSR issues

import type { ConvexAPI } from "../types/domains/convex";

export async function loadApi(): Promise<ConvexAPI> {
  if (typeof window === "undefined") {
    throw new Error("Convex API can only be loaded on the client side");
  }

  try {
    // Use Vite ignore comment to prevent static analysis during bundling
    const path = "../../convex/_generated/api.js";
    const apiModule = await import(/* @vite-ignore */ path);
    return apiModule.api as ConvexAPI;
  } catch (error) {
    console.error("Failed to load Convex API:", error);
    throw error;
  }
}
