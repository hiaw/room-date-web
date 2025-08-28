// Client-side only Convex API loader
// This file acts as a proxy to avoid SSR issues

export async function loadApi() {
  if (typeof window === "undefined") {
    throw new Error("Convex API can only be loaded on the client side");
  }

  try {
    const { api } = await import("../../convex/_generated/api.js");
    return api;
  } catch (error) {
    console.error("Failed to load Convex API:", error);
    throw error;
  }
}
