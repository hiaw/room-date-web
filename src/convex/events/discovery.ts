import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { calculateDistance, calculateUserAge } from "../lib/eventHelpers.js";
import { discoverEventsArgs, eventsNearUserArgs } from "./types.js";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/**
 * Helper function to enrich events with application and bookmark data
 */
async function enrichEventWithDetails(
  ctx: QueryCtx,
  event: Doc<"events">,
  userId: Id<"users"> | null,
) {
  // Get application counts
  const applications = await ctx.db
    .query("eventApplications")
    .withIndex("by_event", (q) => q.eq("eventId", event._id))
    .collect();

  // Check user's application status
  let userApplication: Doc<"eventApplications"> | null = null;
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

  return {
    ...event,
    applicationCount: applications.length,
    pendingApplicationCount: applications.filter(
      (app) => app.status === "pending",
    ).length,
    userApplication,
    isBookmarked,
  };
}

/**
 * Discover active events with filtering
 */
export const discoverEvents = query({
  args: discoverEventsArgs,
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
        const userAge = calculateUserAge(userProfile.dateOfBirth);

        events = events.filter((event) => {
          if (event.minAge && userAge < event.minAge) return false;
          if (event.maxAge && userAge > event.maxAge) return false;
          return true;
        });
      }
    }

    // Gender filtering (check if user's gender matches event preferences)
    if (userId) {
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (userProfile?.gender) {
        events = events.filter((event) => {
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
      const enrichedEvent = await enrichEventWithDetails(ctx, event, userId);
      eventsWithDetails.push(enrichedEvent);
    }

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

    // Start with active events
    const query = ctx.db
      .query("events")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    let events = await query.take(200); // Get more for filtering

    // Filter out user's own events
    if (userId) {
      events = events.filter((event) => event.ownerId !== userId);
    }

    // Gender filtering (check if user's gender matches event preferences)
    if (userId) {
      const userProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (userProfile?.gender) {
        events = events.filter((event) => {
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
      const enrichedEvent = await enrichEventWithDetails(ctx, event, userId);
      eventsWithDetails.push(enrichedEvent);
    }

    return eventsWithDetails;
  },
});
