import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Create a new room
 */
export const createRoom = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    streetAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationVerified: v.optional(v.boolean()),
    images: v.optional(v.array(v.string())),
    primaryImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create room");
    }

    // Validate required fields
    if (!args.title.trim()) {
      throw new Error("Room title is required");
    }

    const roomId = await ctx.db.insert("rooms", {
      ownerId: userId,
      title: args.title.trim(),
      description: args.description?.trim(),
      address: args.address?.trim(),
      streetAddress: args.streetAddress?.trim(),
      city: args.city?.trim(),
      state: args.state?.trim(),
      zipCode: args.zipCode?.trim(),
      country: args.country?.trim(),
      latitude: args.latitude,
      longitude: args.longitude,
      locationVerified: args.locationVerified ?? false,
      images: args.images || [],
      primaryImageUrl: args.primaryImageUrl,
      isActive: true,
    });

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "room_created",
      userId,
      metadata: {
        roomId,
        title: args.title,
        hasLocation: !!(args.latitude && args.longitude),
        imageCount: args.images?.length || 0,
      },
      timestamp: Date.now(),
      severity: "low",
    });

    return roomId;
  },
});

/**
 * Get a specific room by ID
 */
export const getRoom = query({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
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

    let rooms = await query.take(100); // Get more than needed for distance filtering

    // Filter by distance if coordinates provided
    if (args.latitude && args.longitude) {
      const radiusInMiles = args.radiusInMiles || 25;

      rooms = rooms
        .filter((room) => room.latitude && room.longitude)
        .map((room) => ({
          room,
          distance: calculateDistance(
            args.latitude!,
            args.longitude!,
            room.latitude!,
            room.longitude!,
          ),
        }))
        .filter((item) => item.distance <= radiusInMiles)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
        .map((item) => item.room);
    } else {
      rooms = rooms.slice(0, limit);
    }

    // Get owner info for each room
    const roomsWithOwners = [];
    for (const room of rooms) {
      const owner = await ctx.db.get(room.ownerId);
      const ownerProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", room.ownerId))
        .first();

      roomsWithOwners.push({
        ...room,
        owner: owner
          ? {
              ...owner,
              profile: ownerProfile,
            }
          : undefined,
      });
    }

    return roomsWithOwners;
  },
});

/**
 * Update a room
 */
export const updateRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    streetAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationVerified: v.optional(v.boolean()),
    images: v.optional(v.array(v.string())),
    primaryImageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update room");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.ownerId !== userId) {
      throw new Error("Only room owner can update room");
    }

    // Prepare update data
    const updateData: any = {};

    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new Error("Room title cannot be empty");
      }
      updateData.title = args.title.trim();
    }

    if (args.description !== undefined)
      updateData.description = args.description?.trim();
    if (args.address !== undefined) updateData.address = args.address?.trim();
    if (args.streetAddress !== undefined)
      updateData.streetAddress = args.streetAddress?.trim();
    if (args.city !== undefined) updateData.city = args.city?.trim();
    if (args.state !== undefined) updateData.state = args.state?.trim();
    if (args.zipCode !== undefined) updateData.zipCode = args.zipCode?.trim();
    if (args.country !== undefined) updateData.country = args.country?.trim();
    if (args.latitude !== undefined) updateData.latitude = args.latitude;
    if (args.longitude !== undefined) updateData.longitude = args.longitude;
    if (args.locationVerified !== undefined)
      updateData.locationVerified = args.locationVerified;
    if (args.images !== undefined) updateData.images = args.images;
    if (args.primaryImageUrl !== undefined)
      updateData.primaryImageUrl = args.primaryImageUrl;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;

    await ctx.db.patch(args.roomId, updateData);

    // If room was deactivated, also deactivate all associated events
    if (args.isActive === false) {
      const events = await ctx.db
        .query("events")
        .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
        .collect();

      for (const event of events) {
        await ctx.db.patch(event._id, { isActive: false });
      }
    }

    return args.roomId;
  },
});

/**
 * Delete a room (mark as inactive)
 */
export const deleteRoom = mutation({
  args: {
    roomId: v.id("rooms"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to delete room");
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.ownerId !== userId) {
      throw new Error("Only room owner can delete room");
    }

    // Mark room as inactive
    await ctx.db.patch(args.roomId, { isActive: false });

    // Also deactivate all associated events
    const events = await ctx.db
      .query("events")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect();

    for (const event of events) {
      await ctx.db.patch(event._id, { isActive: false });
    }

    return { success: true };
  },
});

/**
 * Helper function to calculate distance between two points in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get rooms owned by current user (alias for getMyRooms)
 */
export const getUserRooms = query({
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
