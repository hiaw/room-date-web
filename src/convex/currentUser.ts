import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get current session info for debugging
export const getCurrentSession = query({
  args: {},
  handler: async (ctx) => {
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
