import { defineTable } from "convex/server";
import { v } from "convex/values";

// Events - time-based gatherings hosted within rooms
export const events = defineTable({
  roomId: v.id("rooms"),
  ownerId: v.id("users"), // Denormalized for faster queries
  roomTitle: v.string(), // Denormalized room title for better UX
  roomCity: v.optional(v.string()), // Denormalized for location filtering
  roomLatitude: v.optional(v.number()), // Denormalized for geospatial queries
  roomLongitude: v.optional(v.number()), // Denormalized for geospatial queries
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  startTime: v.optional(v.number()), // timestamp
  endTime: v.optional(v.number()), // timestamp
  isFlexibleTiming: v.boolean(),
  // Suggested time slots for flexible events
  suggestedTimeSlots: v.optional(
    v.array(
      v.object({
        startTime: v.number(),
        endTime: v.number(),
        label: v.optional(v.string()), // e.g., "Saturday morning", "Weekend evening"
      }),
    ),
  ),
  maxGuests: v.optional(v.number()),
  preferredGender: v.optional(v.array(v.string())), // ['male', 'female', 'non_binary', 'any']
  minAge: v.optional(v.number()),
  maxAge: v.optional(v.number()),
  // Event categorization and interests
  category: v.optional(v.string()), // e.g., 'social', 'dining', 'games', 'arts', 'fitness', 'professional'
  tags: v.optional(v.array(v.string())), // Flexible tags for filtering
  activityLevel: v.optional(
    v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  ),
  // Media support for events
  eventImages: v.optional(v.array(v.string())),
  primaryEventImageUrl: v.optional(v.string()),
  isActive: v.boolean(),
})
  .index("by_room", ["roomId"])
  .index("by_owner", ["ownerId"])
  .index("by_active", ["isActive"])
  .index("by_start_time", ["startTime"])
  .index("by_active_start", ["isActive", "startTime"])
  .index("by_location", ["roomLatitude", "roomLongitude"]) // Geospatial queries
  .index("by_active_location", ["isActive", "roomLatitude", "roomLongitude"])
  .index("by_city_active", ["roomCity", "isActive"])
  .index("by_category", ["category", "isActive"])
  .index("by_activity_level", ["activityLevel", "isActive"]);

// Event Applications - users apply to join events
export const eventApplications = defineTable({
  eventId: v.id("events"),
  applicantId: v.id("users"),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("cancelled"),
  ),
  message: v.optional(v.string()), // Optional message from applicant
  ownerResponse: v.optional(v.string()), // Optional response from event owner
  // Denormalize event info for better mobile UX
  eventTitle: v.optional(v.string()),
  eventStartTime: v.optional(v.number()),
  roomTitle: v.string(),
})
  .index("by_event", ["eventId"])
  .index("by_applicant", ["applicantId"])
  .index("by_status", ["status"])
  .index("by_event_status", ["eventId", "status"])
  .index("by_applicant_status", ["applicantId", "status"]);

// Event Bookmarks/Favorites - users can save events for later
export const eventBookmarks = defineTable({
  eventId: v.id("events"),
  userId: v.id("users"),
  // Denormalized event info for quick access
  eventTitle: v.optional(v.string()),
  roomTitle: v.string(),
  eventStartTime: v.optional(v.number()),
})
  .index("by_user", ["userId"])
  .index("by_event", ["eventId"])
  .index("by_user_event", ["userId", "eventId"]);

// Event Views - track when users view events (for analytics/recommendations)
export const eventViews = defineTable({
  eventId: v.id("events"),
  viewerId: v.id("users"),
  viewCount: v.number(), // How many times this user has viewed this event
  lastViewedAt: v.number(), // timestamp of last view
  // Denormalized for analytics
  eventOwnerId: v.id("users"),
  roomCity: v.optional(v.string()),
})
  .index("by_event", ["eventId"])
  .index("by_viewer", ["viewerId"])
  .index("by_event_viewer", ["eventId", "viewerId"])
  .index("by_viewer_time", ["viewerId", "lastViewedAt"]);

export const eventSchemas = {
  events,
  eventApplications,
  eventBookmarks,
  eventViews,
};
