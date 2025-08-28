import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { RoomWithOwner } from "./types";
import { filterRoomsByLocation } from "./validation";

/**
 * Get a specific room by ID
 */
export const getRoom = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args): Promise<RoomWithOwner | null> => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isActive) {
      return null;
    }

    // Get owner information
    const owner = await ctx.db.get(room.ownerId);
    const ownerProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", room.ownerId))
      .first();

    return {
      ...room,
      owner: owner
        ? {
            ...owner,
            profile: ownerProfile,
          }
        : undefined,
    };
  },
});

/**
 * Get rooms owned by the current user
 */
export const getMyRooms = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("rooms")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId));

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("isActive"), true));
    }

    const rooms = await query.collect();

    return rooms;
  },
});

/**
 * Get active rooms with optional location filtering
 */
export const getActiveRooms = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    radiusInMiles: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    let query = ctx.db
      .query("rooms")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    // Filter by city if provided
    if (args.city) {
      query = query.filter((q) => q.eq(q.field("city"), args.city));
    }

    let rooms = await query.take(limit * 2); // Get more to allow for distance filtering

    // Apply geospatial filtering if coordinates provided
    if (args.latitude && args.longitude && args.radiusInMiles) {
      rooms = filterRoomsByLocation(
        rooms,
        args.latitude,
        args.longitude,
        args.radiusInMiles,
      );
    }

    // Limit results
    return rooms.slice(0, limit);
  },
});

/**
 * Get public rooms for a specific user (for profile viewing)
 */
export const getUserRooms = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(limit);

    return rooms;
  },
});
