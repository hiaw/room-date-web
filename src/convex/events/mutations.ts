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

    // Check if user has sufficient credits for the event
    const maxGuestsCount = args.maxGuests ?? 1; // Default to 1 if not specified
    const creditRecord = await ctx.db
      .query("connectionCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!creditRecord || creditRecord.availableCredits < maxGuestsCount) {
      const availableCredits = creditRecord?.availableCredits ?? 0;
      throw new Error(
        `Insufficient connection credits. You need ${maxGuestsCount} credits but only have ${availableCredits}. Purchase more credits to create this event.`,
      );
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
      maxGuests: maxGuestsCount,
      guestGenderPreferences: args.guestGenderPreferences,
      minAge: args.minAge,
      maxAge: args.maxAge,
      eventImages: args.eventImages || [],
      primaryEventImageUrl: args.primaryEventImageUrl,
      chatParticipantCount: 1, // Initialize with owner count
      isActive: true,
    });

    // Hold credits for this event
    await ctx.db.insert("creditHolds", {
      userId: userId as Id<"users">,
      eventId: eventId,
      creditsHeld: maxGuestsCount,
      maxGuests: maxGuestsCount,
      creditsUsed: 0,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user's credit balance
    await ctx.db.patch(creditRecord._id, {
      availableCredits: creditRecord.availableCredits - maxGuestsCount,
      heldCredits: creditRecord.heldCredits + maxGuestsCount,
      lastUpdated: Date.now(),
    });

    // Record credit hold transaction
    await ctx.db.insert("creditTransactions", {
      userId: userId as Id<"users">,
      type: "hold",
      amount: -maxGuestsCount,
      relatedEventId: eventId,
      description: `Credits held for event "${args.title}" (${maxGuestsCount} credits)`,
      timestamp: Date.now(),
    });

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "event_created",
      userId: userId as Id<"users">,
      metadata: {
        eventId,
        roomId: args.roomId,
        title: args.title,
        maxGuests: maxGuestsCount,
        creditsHeld: maxGuestsCount,
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
 * Delete an event (mark as inactive and release held credits)
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

    // Release held credits
    const hold = await ctx.db
      .query("creditHolds")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.eq(q.field("status"), "active"),
        ),
      )
      .unique();

    if (hold) {
      const creditsToRelease = hold.creditsHeld - hold.creditsUsed;

      if (creditsToRelease > 0) {
        // Get user's credit record
        const creditRecord = await ctx.db
          .query("connectionCredits")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .unique();

        if (creditRecord) {
          // Release unused credits back to available
          await ctx.db.patch(creditRecord._id, {
            availableCredits: creditRecord.availableCredits + creditsToRelease,
            heldCredits: creditRecord.heldCredits - creditsToRelease,
            lastUpdated: Date.now(),
          });

          // Record transaction
          await ctx.db.insert("creditTransactions", {
            userId: userId as Id<"users">,
            type: "release",
            amount: creditsToRelease,
            relatedEventId: args.eventId,
            description: `Credits released from deleted event (${creditsToRelease} credits)`,
            timestamp: Date.now(),
          });
        }
      }

      // Mark hold as released
      await ctx.db.patch(hold._id, {
        status: "released",
        updatedAt: Date.now(),
      });
    }

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
