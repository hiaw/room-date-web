import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get push notification tokens for a user
 */
export const getPushTokens = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const targetUserId = args.userId || currentUserId;

    if (!targetUserId) {
      return [];
    }

    // Only allow viewing own tokens or if you're the system
    if (currentUserId !== targetUserId) {
      throw new Error("Access denied");
    }

    const tokens = await ctx.db
      .query("pushNotificationTokens")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", targetUserId).eq("isActive", true),
      )
      .collect();

    return tokens;
  },
});
