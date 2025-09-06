import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { calculateDistance, calculateUserAge } from "../lib/eventHelpers.js";
import { discoverEventsArgs, eventsNearUserArgs } from "./types.js";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/**
 * Helper function to enrich events with application and bookmark data (optimized)
 */
async function enrichEventsWithDetails(
  ctx: QueryCtx,
  events: Doc<"events">[],
  userId: Id<"users"> | null,
) {
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e._id);

  // Batch queries for better performance
  const [applicationsMap, userBookmarks] = await Promise.all([
    // Get all applications for these events
    Promise.all(
      eventIds.map(async (eventId) => {
        const apps = await ctx.db
          .query("eventApplications")
          .withIndex("by_event", (q) => q.eq("eventId", eventId))
          .collect();
        return [eventId, apps] as const;
      }),
    ).then((results) => new Map(results)),

    // Get user's bookmarks if authenticated
    userId
      ? ctx.db
          .query("eventBookmarks")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      : Promise.resolve([]),
  ]);

  const bookmarkedEventIds = new Set(userBookmarks.map((b) => b.eventId));

  return events.map((event) => {
    const applications = applicationsMap.get(event._id) || [];
    const userApplication = userId
      ? applications.find((app) => app.applicantId === userId) || null
      : null;

    return {
      ...event,
      applicationCount: applications.length,
      pendingApplicationCount: applications.filter(
        (app) => app.status === "pending",
      ).length,
      userApplication,
      isBookmarked: userId ? bookmarkedEventIds.has(event._id) : false,
    };
  });
}

/**
 * Helper function to filter out events user has already applied to
 */
async function filterOutAppliedEvents(
  ctx: QueryCtx,
  events: Doc<"events">[],
  userId: Id<"users"> | null,
): Promise<Doc<"events">[]> {
  if (!userId) return events;

  const userApplications = await ctx.db
    .query("eventApplications")
    .withIndex("by_applicant", (q) => q.eq("applicantId", userId))
    .collect();

  const appliedEventIds = new Set(userApplications.map((app) => app.eventId));
  return events.filter((event) => !appliedEventIds.has(event._id));
}

/**
 * Helper function to filter events by gender preferences
 */
async function filterByGenderPreferences(
  events: Doc<"events">[],
  userProfile: Doc<"userProfiles"> | null,
): Promise<Doc<"events">[]> {
  if (!userProfile?.gender) return events;

  return events.filter((event) => {
    // If event has no gender preferences, allow all genders
    if (
      !event.guestGenderPreferences ||
      event.guestGenderPreferences.length === 0
    ) {
      return true;
    }

    // Check if user's gender is in the event's preferred genders
    // Also check for "any" preference
    return (
      event.guestGenderPreferences.includes(userProfile.gender!) ||
      event.guestGenderPreferences.includes("any")
    );
  });
}

/**
 * Discover active events with filtering
 */
export const discoverEvents = query({
  args: discoverEventsArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const limit = args.limit || 20;

    // Fetch user profile once if needed
    let userProfile: Doc<"userProfiles"> | null = null;
    if (userId) {
      userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
    }

    // Start with active events
    const query = ctx.db
      .query("events")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    let events = await query.take(100); // Reduced from 200 for better performance

    // Filter out user's own events
    if (userId) {
      events = events.filter((event) => event.ownerId !== userId);
    }

    // Apply shared filtering logic
    events = await filterOutAppliedEvents(ctx, events, userId);
    events = await filterByGenderPreferences(events, userProfile);

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
    if (userId && (args.minAge || args.maxAge) && userProfile?.dateOfBirth) {
      const userAge = calculateUserAge(userProfile.dateOfBirth);

      events = events.filter((event) => {
        if (event.minAge && userAge < event.minAge) return false;
        if (event.maxAge && userAge > event.maxAge) return false;
        return true;
      });
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

    // Get additional details for each event (batch processing)
    const eventsWithDetails = await enrichEventsWithDetails(
      ctx,
      events,
      userId,
    );

    return eventsWithDetails;
  },
});

/**
 * Get events near user location (optimized version)
 */
export const getEventsNearUser = query({
  args: eventsNearUserArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const limit = args.limit || 20;
    const radiusInMiles = args.radiusMiles || 25;

    // Fetch user profile once if needed
    let userProfile: Doc<"userProfiles"> | null = null;
    if (userId) {
      userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();
    }

    // Start with active events
    const query = ctx.db
      .query("events")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    let events = await query.take(100); // Reduced from 200 for better performance

    // Filter out user's own events
    if (userId) {
      events = events.filter((event) => event.ownerId !== userId);
    }

    // Apply shared filtering logic
    events = await filterOutAppliedEvents(ctx, events, userId);
    events = await filterByGenderPreferences(events, userProfile);

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

    // Get additional details for each event (batch processing)
    const eventsWithDetails = await enrichEventsWithDetails(
      ctx,
      events,
      userId,
    );

    return eventsWithDetails;
  },
});
