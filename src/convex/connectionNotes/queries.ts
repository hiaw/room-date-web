import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const getConnectionNote = query({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, { connectionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("connectionNotes")
      .withIndex("by_connection_user", (q) =>
        q.eq("connectionId", connectionId).eq("userId", userId),
      )
      .first();
  },
});

export const getUserConnectionNotes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("connectionNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
