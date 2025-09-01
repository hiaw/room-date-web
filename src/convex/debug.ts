import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Debug authentication context
export const debugAuth = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);
      const identity = await ctx.auth.getUserIdentity();

      return {
        userId,
        identity,
        hasAuth: !!userId,
        authMethod: identity?.issuer || "unknown",
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: null,
        identity: null,
        hasAuth: false,
      };
    }
  },
});

// Test mutation to verify auth
export const testAuthMutation = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await getAuthUserId(ctx);

      if (!userId) {
        throw new Error("Not authenticated");
      }

      // Try to fetch the user
      const user = await ctx.db.get(userId);

      return {
        success: true,
        userId,
        userExists: !!user,
        userEmail: user?.email,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
