import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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

/**
 * Get user analytics/insights
 */
export const getUserInsights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Count rooms created
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const activeRooms = rooms.filter((room) => room.isActive);

    // Count events hosted
    const events = await ctx.db
      .query("events")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const activeEvents = events.filter((event) => event.isActive);

    // Count applications sent
    const applicationsSent = await ctx.db
      .query("eventApplications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", userId))
      .collect();

    // Count applications received
    const applicationsReceived = [];
    for (const event of events) {
      const eventApplications = await ctx.db
        .query("eventApplications")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      applicationsReceived.push(...eventApplications);
    }

    // Count connections
    const connections1 = await ctx.db
      .query("connections")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    const connections2 = await ctx.db
      .query("connections")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    const activeConnections = [...connections1, ...connections2].filter(
      (conn) => conn.status === "active",
    );

    return {
      totalRoomsCreated: rooms.length,
      totalActiveRooms: activeRooms.length,
      totalEventsHosted: events.length,
      totalActiveEvents: activeEvents.length,
      totalApplicationsSent: applicationsSent.length,
      totalApplicationsReceived: applicationsReceived.length,
      totalConnections: activeConnections.length,
      memberSince: new Date(Math.min(...rooms.map((r) => r._creationTime))),
    };
  },
});
