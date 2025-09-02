// Client-side only Convex API loader
// This file acts as a proxy to avoid SSR issues

export async function loadApi() {
  if (typeof window === "undefined") {
    throw new Error("Convex API can only be loaded on the client side");
  }

  try {
    // Create a fake Promise to return the actual import result
    // This bypasses TypeScript's deep type analysis
    return await new Promise((resolve) => {
      import("../../convex/_generated/api.js").then((module) => {
        resolve(module.api);
      });
    });
  } catch (error) {
    console.error("Failed to load Convex API:", error);
    throw error;
  }
}
