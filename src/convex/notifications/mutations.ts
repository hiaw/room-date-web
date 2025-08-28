import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Register a push notification token
 */
export const registerPushToken = mutation({
  args: {
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to register push token");
    }

    // Check if token already exists
    const existingToken = await ctx.db
      .query("pushNotificationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (existingToken) {
      // Update existing token
      await ctx.db.patch(existingToken._id, {
        userId,
        platform: args.platform,
        isActive: true,
        lastUsed: Date.now(),
      });
      return existingToken._id;
    } else {
      // Create new token
      const tokenId = await ctx.db.insert("pushNotificationTokens", {
        userId,
        token: args.token,
        platform: args.platform,
        isActive: true,
        lastUsed: Date.now(),
      });
      return tokenId;
    }
  },
});

/**
 * Deactivate a push notification token
 */
export const deactivatePushToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to deactivate push token");
    }

    const tokenRecord = await ctx.db
      .query("pushNotificationTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!tokenRecord || tokenRecord.userId !== userId) {
      throw new Error("Push token not found or access denied");
    }

    await ctx.db.patch(tokenRecord._id, { isActive: false });

    return { success: true };
  },
});
