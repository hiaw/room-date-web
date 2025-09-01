import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Check if we're in development mode
const isDevelopment = process.env.CONVEX_DEPLOYMENT?.includes("dev:") ?? false;

// Get current session info for debugging (development only)
export const getCurrentSession = query({
  args: {},
  handler: async (ctx) => {
    // Only expose debug info in development environment
    if (!isDevelopment) {
      throw new Error("Debug endpoints are not available in production");
    }

    const userId = await getAuthUserId(ctx);

    if (userId) {
      const user = await ctx.db.get(userId);
      return {
        authenticated: true,
        userId,
        user,
      };
    }

    return {
      authenticated: false,
      userId: null,
      user: null,
    };
  },
});
