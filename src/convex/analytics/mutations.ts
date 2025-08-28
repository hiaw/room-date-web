import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Record an event view for analytics
 */
export const recordEventView = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null; // Allow anonymous views, but don't record them
    }

    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) {
      return null;
    }

    // Check if view record exists
    const existingView = await ctx.db
      .query("eventViews")
      .withIndex("by_event_viewer", (q) =>
        q.eq("eventId", args.eventId).eq("viewerId", userId),
      )
      .first();

    if (existingView) {
      // Update existing view count
      await ctx.db.patch(existingView._id, {
        viewCount: existingView.viewCount + 1,
        lastViewedAt: Date.now(),
      });
      return existingView._id;
    } else {
      // Create new view record
      const viewId = await ctx.db.insert("eventViews", {
        eventId: args.eventId,
        viewerId: userId,
        viewCount: 1,
        lastViewedAt: Date.now(),
        // Denormalized for analytics
        eventOwnerId: event.ownerId,
        roomCity: event.roomCity,
      });
      return viewId;
    }
  },
});
