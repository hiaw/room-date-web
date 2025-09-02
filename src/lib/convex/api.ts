// Client-side only Convex API loader
// This file acts as a proxy to avoid SSR issues

export async function loadApi() {
  if (typeof window === "undefined") {
    throw new Error("Convex API can only be loaded on the client side");
  }

  try {
    // Use eval to avoid static type checking during bundling
    const apiModule = await eval('import("../../convex/_generated/api.js")');
    return apiModule.api;
  } catch (error) {
    console.error("Failed to load Convex API:", error);
    throw error;
  }
}
