import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { validateRoomOwnership, validateRoomTitle } from "./validation";

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
    validateRoomTitle(args.title);

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
 * Update an existing room
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update room");
    }

    // Validate ownership
    await validateRoomOwnership(ctx, args.roomId, userId);

    // Validate title if provided
    if (args.title !== undefined) {
      validateRoomTitle(args.title);
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (args.title !== undefined) updateData.title = args.title.trim();
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

    await ctx.db.patch(args.roomId, updateData);

    return args.roomId;
  },
});

/**
 * Delete a room (soft delete by setting isActive to false)
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

    // Validate ownership
    await validateRoomOwnership(ctx, args.roomId, userId);

    // Check if room has active events
    const activeEvents = await ctx.db
      .query("events")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (activeEvents) {
      throw new Error("Cannot delete room with active events");
    }

    // Soft delete the room
    await ctx.db.patch(args.roomId, { isActive: false });

    return args.roomId;
  },
});
