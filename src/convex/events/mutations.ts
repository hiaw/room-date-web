import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { validateEventTiming, validateAgeRange } from "../lib/eventHelpers.js";
import { createEventArgs, updateEventArgs } from "./types.js";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Create a new event
 */
export const createEvent = mutation({
  args: createEventArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create event");
    }

    // Verify room exists and user owns it
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("Room not found");
    }

    if (room.ownerId !== userId) {
      throw new Error("Only room owner can create events in this room");
    }

    if (!room.isActive) {
      throw new Error("Cannot create events in inactive room");
    }

    // Validate timing
    if (!args.isFlexibleTiming) {
      validateEventTiming(args.startTime, args.endTime);
    }

    // Validate age restrictions
    validateAgeRange(args.minAge, args.maxAge);

    const eventId = await ctx.db.insert("events", {
      roomId: args.roomId,
      ownerId: userId,
      // Denormalized room data for performance
      roomTitle: room.title,
      roomCity: room.city,
      roomLatitude: room.latitude,
      roomLongitude: room.longitude,

      title: args.title?.trim(),
      description: args.description?.trim(),
      startTime: args.startTime,
      endTime: args.endTime,
      isFlexibleTiming: args.isFlexibleTiming,
      suggestedTimeSlots: args.suggestedTimeSlots,
      maxGuests: args.maxGuests,
      guestGenderPreferences: args.guestGenderPreferences,
      minAge: args.minAge,
      maxAge: args.maxAge,
      eventImages: args.eventImages || [],
      primaryEventImageUrl: args.primaryEventImageUrl,
      chatParticipantCount: 1, // Initialize with owner count
      isActive: true,
    });

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "event_created",
      userId: userId as Id<"users">,
      metadata: {
        eventId,
        roomId: args.roomId,
        title: args.title,
        isFlexibleTiming: args.isFlexibleTiming,
        hasTimeSlots: !!args.suggestedTimeSlots?.length,
      },
      timestamp: Date.now(),
      severity: "low",
    });

    // Add event owner to chat participants
    await ctx.db.insert("eventChatParticipants", {
      eventId: eventId,
      userId: userId as Id<"users">,
      role: "owner",
      joinedAt: Date.now(),
    });

    return eventId;
  },
});

/**
 * Update an event
 */
export const updateEvent = mutation({
  args: updateEventArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update event");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.ownerId !== (userId as Id<"users">)) {
      throw new Error("Only event owner can update event");
    }

    // Validate timing if updated
    if (args.startTime !== undefined && args.endTime !== undefined) {
      validateEventTiming(args.startTime, args.endTime);
    }

    // Validate age restrictions
    validateAgeRange(args.minAge, args.maxAge);

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (args.title !== undefined) updateData.title = args.title?.trim();
    if (args.description !== undefined)
      updateData.description = args.description?.trim();
    if (args.startTime !== undefined) updateData.startTime = args.startTime;
    if (args.endTime !== undefined) updateData.endTime = args.endTime;
    if (args.isFlexibleTiming !== undefined)
      updateData.isFlexibleTiming = args.isFlexibleTiming;
    if (args.suggestedTimeSlots !== undefined)
      updateData.suggestedTimeSlots = args.suggestedTimeSlots;
    if (args.maxGuests !== undefined) updateData.maxGuests = args.maxGuests;
    if (args.guestGenderPreferences !== undefined)
      updateData.guestGenderPreferences = args.guestGenderPreferences;
    if (args.minAge !== undefined) updateData.minAge = args.minAge;
    if (args.maxAge !== undefined) updateData.maxAge = args.maxAge;
    if (args.eventImages !== undefined)
      updateData.eventImages = args.eventImages;
    if (args.primaryEventImageUrl !== undefined)
      updateData.primaryEventImageUrl = args.primaryEventImageUrl;
    if (args.isActive !== undefined) updateData.isActive = args.isActive;

    await ctx.db.patch(args.eventId, updateData);

    return args.eventId;
  },
});

/**
 * Delete an event (mark as inactive)
 */
export const deleteEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to delete event");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.ownerId !== userId) {
      throw new Error("Only event owner can delete event");
    }

    // Mark event as inactive
    await ctx.db.patch(args.eventId, { isActive: false });

    // Cancel all pending applications
    const pendingApplications = await ctx.db
      .query("eventApplications")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", args.eventId).eq("status", "pending"),
      )
      .collect();

    for (const app of pendingApplications) {
      await ctx.db.patch(app._id, { status: "cancelled" });
    }

    return { success: true };
  },
});
