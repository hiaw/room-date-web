import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Bookmark an event
 */
export const bookmarkEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to bookmark events");
    }

    // Check if event exists and is active
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) {
      throw new Error("Event not found or inactive");
    }

    // Check if already bookmarked
    const existingBookmark = await ctx.db
      .query("eventBookmarks")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", args.eventId),
      )
      .first();

    if (existingBookmark) {
      throw new Error("Event already bookmarked");
    }

    const bookmarkId = await ctx.db.insert("eventBookmarks", {
      eventId: args.eventId,
      userId,
      // Denormalized event info for quick access
      eventTitle: event.title,
      roomTitle: event.roomTitle,
      eventStartTime: event.startTime,
    });

    return bookmarkId;
  },
});

/**
 * Remove bookmark from an event
 */
export const unbookmarkEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to unbookmark events");
    }

    const bookmark = await ctx.db
      .query("eventBookmarks")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", args.eventId),
      )
      .first();

    if (!bookmark) {
      throw new Error("Event not bookmarked");
    }

    await ctx.db.delete(bookmark._id);

    return { success: true };
  },
});
