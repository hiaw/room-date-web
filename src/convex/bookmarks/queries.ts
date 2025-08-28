import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get user's bookmarked events
 */
export const getBookmarkedEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 20;

    const bookmarks = await ctx.db
      .query("eventBookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Get full event details for each bookmark
    const bookmarkedEvents = [];
    for (const bookmark of bookmarks) {
      const event = await ctx.db.get(bookmark.eventId);
      if (event && event.isActive) {
        // Get room info
        const room = await ctx.db.get(event.roomId);

        bookmarkedEvents.push({
          bookmark,
          event: {
            ...event,
            room,
          },
        });
      }
    }

    return bookmarkedEvents;
  },
});
