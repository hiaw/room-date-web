import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";

/**
 * Get a specific event by ID with details
 */
export const getEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) {
      return null;
    }

    // Get room info
    const room = await ctx.db.get(event.roomId);

    // Get owner info
    const owner = await ctx.db.get(event.ownerId);
    const ownerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", event.ownerId))
      .first();

    // Get application counts
    const allApplications = await ctx.db
      .query("eventApplications")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const applicationCount = allApplications.length;
    const pendingApplicationCount = allApplications.filter(
      (app) => app.status === "pending",
    ).length;

    // Check if current user has applied
    let userApplication: Doc<"eventApplications"> | null = null;
    if (userId) {
      userApplication =
        allApplications.find(
          (app) => app.applicantId === (userId as Id<"users">),
        ) || null;
    }

    // Check if current user has bookmarked this event
    let isBookmarked = false;
    if (userId) {
      const bookmark = await ctx.db
        .query("eventBookmarks")
        .withIndex("by_user_event", (q) =>
          q.eq("userId", userId as Id<"users">).eq("eventId", args.eventId),
        )
        .first();
      isBookmarked = !!bookmark;
    }

    return {
      ...event,
      room,
      owner: owner
        ? {
            ...owner,
            profile: ownerProfile,
          }
        : undefined,
      applicationCount,
      pendingApplicationCount,
      userApplication,
      isBookmarked,
    };
  },
});

/**
 * Get events for a specific room
 */
export const getRoomEvents = query({
  args: {
    roomId: v.id("rooms"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("events")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId));

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("isActive"), true));
    }

    const events = await query.collect();

    return events;
  },
});

/**
 * Get events owned by current user
 */
export const getMyEvents = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("events")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId));

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("isActive"), true));
    }

    const events = await query.collect();

    return events;
  },
});

/**
 * Get events owned by current user (alias for getMyEvents)
 */
export const getUserEvents = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("events")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId));

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("isActive"), true));
    }

    const events = await query.collect();

    return events;
  },
});
