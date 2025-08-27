import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Create a new event
 */
export const createEvent = mutation({
  args: {
    roomId: v.id("rooms"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    isFlexibleTiming: v.boolean(),
    suggestedTimeSlots: v.optional(
      v.array(
        v.object({
          startTime: v.number(),
          endTime: v.number(),
          label: v.optional(v.string()),
        }),
      ),
    ),
    maxGuests: v.optional(v.number()),
    preferredGender: v.optional(v.array(v.string())),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    eventImages: v.optional(v.array(v.string())),
    primaryEventImageUrl: v.optional(v.string()),
  },
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
    if (!args.isFlexibleTiming && args.startTime && args.endTime) {
      if (args.startTime >= args.endTime) {
        throw new Error("End time must be after start time");
      }
      if (args.startTime < Date.now()) {
        throw new Error("Event cannot start in the past");
      }
    }

    // Validate age restrictions
    if (args.minAge && args.maxAge && args.minAge > args.maxAge) {
      throw new Error("Minimum age cannot be greater than maximum age");
    }

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
      preferredGender: args.preferredGender,
      minAge: args.minAge,
      maxAge: args.maxAge,
      eventImages: args.eventImages || [],
      primaryEventImageUrl: args.primaryEventImageUrl,
      isActive: true,
    });

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "event_created",
      userId,
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

    return eventId;
  },
});

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
    let userApplication = null;
    if (userId) {
      userApplication =
        allApplications.find((app) => app.applicantId === userId) || null;
    }

    // Check if current user has bookmarked this event
    let isBookmarked = false;
    if (userId) {
      const bookmark = await ctx.db
        .query("eventBookmarks")
        .withIndex("by_user_event", (q) =>
          q.eq("userId", userId).eq("eventId", args.eventId),
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
 * Discover active events with filtering
 */
export const discoverEvents = query({
  args: {
    city: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    radiusInMiles: v.optional(v.number()),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    preferredGender: v.optional(v.array(v.string())),
    isFlexibleTiming: v.optional(v.boolean()),
    startDateAfter: v.optional(v.number()),
    startDateBefore: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const limit = args.limit || 20;

    // Start with active events
    const query = ctx.db
      .query("events")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    let events = await query.take(200); // Get more for filtering

    // Filter out user's own events
    if (userId) {
      events = events.filter((event) => event.ownerId !== userId);
    }

    // Apply filters
    if (args.city) {
      events = events.filter((event) => event.roomCity === args.city);
    }

    if (args.isFlexibleTiming !== undefined) {
      events = events.filter(
        (event) => event.isFlexibleTiming === args.isFlexibleTiming,
      );
    }

    if (args.startDateAfter) {
      events = events.filter(
        (event) => !event.startTime || event.startTime >= args.startDateAfter!,
      );
    }

    if (args.startDateBefore) {
      events = events.filter(
        (event) => !event.startTime || event.startTime <= args.startDateBefore!,
      );
    }

    // Age filtering (check if user's age fits event preferences)
    if (userId && (args.minAge || args.maxAge)) {
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (userProfile?.dateOfBirth) {
        const userAge = Math.floor(
          (Date.now() - userProfile.dateOfBirth) /
            (365.25 * 24 * 60 * 60 * 1000),
        );

        events = events.filter((event) => {
          if (event.minAge && userAge < event.minAge) return false;
          if (event.maxAge && userAge > event.maxAge) return false;
          return true;
        });
      }
    }

    // Distance filtering
    if (args.latitude && args.longitude) {
      const radiusInMiles = args.radiusInMiles || 25;

      events = events
        .filter((event) => event.roomLatitude && event.roomLongitude)
        .map((event) => ({
          event,
          distance: calculateDistance(
            args.latitude!,
            args.longitude!,
            event.roomLatitude!,
            event.roomLongitude!,
          ),
        }))
        .filter((item) => item.distance <= radiusInMiles)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
        .map((item) => item.event);
    } else {
      // Sort by creation time (newest first)
      events = events
        .sort((a, b) => b._creationTime - a._creationTime)
        .slice(0, limit);
    }

    // Get additional details for each event
    const eventsWithDetails = [];
    for (const event of events) {
      // Get application count
      const applications = await ctx.db
        .query("eventApplications")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      // Check user's application status
      let userApplication = null;
      if (userId) {
        userApplication =
          applications.find((app) => app.applicantId === userId) || null;
      }

      // Check if bookmarked
      let isBookmarked = false;
      if (userId) {
        const bookmark = await ctx.db
          .query("eventBookmarks")
          .withIndex("by_user_event", (q) =>
            q.eq("userId", userId).eq("eventId", event._id),
          )
          .first();
        isBookmarked = !!bookmark;
      }

      eventsWithDetails.push({
        ...event,
        applicationCount: applications.length,
        pendingApplicationCount: applications.filter(
          (app) => app.status === "pending",
        ).length,
        userApplication,
        isBookmarked,
      });
    }

    return eventsWithDetails;
  },
});

/**
 * Update an event
 */
export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    isFlexibleTiming: v.optional(v.boolean()),
    suggestedTimeSlots: v.optional(
      v.array(
        v.object({
          startTime: v.number(),
          endTime: v.number(),
          label: v.optional(v.string()),
        }),
      ),
    ),
    maxGuests: v.optional(v.number()),
    preferredGender: v.optional(v.array(v.string())),
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    eventImages: v.optional(v.array(v.string())),
    primaryEventImageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update event");
    }

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.ownerId !== userId) {
      throw new Error("Only event owner can update event");
    }

    // Validate timing if updated
    if (args.startTime !== undefined && args.endTime !== undefined) {
      if (args.startTime >= args.endTime) {
        throw new Error("End time must be after start time");
      }
    }

    // Validate age restrictions
    if (
      args.minAge !== undefined &&
      args.maxAge !== undefined &&
      args.minAge > args.maxAge
    ) {
      throw new Error("Minimum age cannot be greater than maximum age");
    }

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
    if (args.preferredGender !== undefined)
      updateData.preferredGender = args.preferredGender;
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

/**
 * Get events near user location (alias for discoverEvents)
 */
export const getEventsNearUser = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusMiles: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const limit = args.limit || 20;
    const radiusInMiles = args.radiusMiles || 25;

    // Start with active events
    const query = ctx.db
      .query("events")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    let events = await query.take(200); // Get more for filtering

    // Filter out user's own events
    if (userId) {
      events = events.filter((event) => event.ownerId !== userId);
    }

    // Distance filtering
    events = events
      .filter((event) => event.roomLatitude && event.roomLongitude)
      .map((event) => ({
        event,
        distance: calculateDistance(
          args.latitude,
          args.longitude,
          event.roomLatitude!,
          event.roomLongitude!,
        ),
      }))
      .filter((item) => item.distance <= radiusInMiles)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map((item) => item.event);

    // Get additional details for each event
    const eventsWithDetails = [];
    for (const event of events) {
      // Get application count
      const applications = await ctx.db
        .query("eventApplications")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();

      // Check user's application status
      let userApplication = null;
      if (userId) {
        userApplication =
          applications.find((app) => app.applicantId === userId) || null;
      }

      // Check if bookmarked
      let isBookmarked = false;
      if (userId) {
        const bookmark = await ctx.db
          .query("eventBookmarks")
          .withIndex("by_user_event", (q) =>
            q.eq("userId", userId).eq("eventId", event._id),
          )
          .first();
        isBookmarked = !!bookmark;
      }

      eventsWithDetails.push({
        ...event,
        applicationCount: applications.length,
        pendingApplicationCount: applications.filter(
          (app) => app.status === "pending",
        ).length,
        userApplication,
        isBookmarked,
      });
    }

    return eventsWithDetails;
  },
});
