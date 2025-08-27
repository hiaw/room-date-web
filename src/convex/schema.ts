import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,

  // User profiles - extends the auth users table with additional info
  userProfiles: defineTable({
    userId: v.id("users"),
    displayName: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()), // timestamp
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    isProfileComplete: v.boolean(),
  }).index("by_user", ["userId"]),

  // Rooms - physical spaces that can host events
  rooms: defineTable({
    ownerId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    streetAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    country: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_active", ["isActive"])
    .index("by_city", ["city"]),

  // Events - time-based gatherings hosted within rooms
  events: defineTable({
    roomId: v.id("rooms"),
    ownerId: v.id("users"), // Denormalized for faster queries
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()), // timestamp
    endTime: v.optional(v.number()), // timestamp
    isFlexibleTiming: v.boolean(),
    maxGuests: v.optional(v.number()),
    preferredGender: v.optional(v.array(v.string())), // ['male', 'female', 'non_binary', 'any']
    minAge: v.optional(v.number()),
    maxAge: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_room", ["roomId"])
    .index("by_owner", ["ownerId"])
    .index("by_active", ["isActive"])
    .index("by_start_time", ["startTime"])
    .index("by_active_start", ["isActive", "startTime"]),

  // Event Applications - users apply to join events
  eventApplications: defineTable({
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
  })
    .index("by_event", ["eventId"])
    .index("by_applicant", ["applicantId"])
    .index("by_status", ["status"])
    .index("by_event_status", ["eventId", "status"])
    .index("by_applicant_status", ["applicantId", "status"]),

  // Connections - direct relationships between users (created after approved applications)
  connections: defineTable({
    user1Id: v.id("users"),
    user2Id: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("blocked_by_user1"),
      v.literal("blocked_by_user2"),
      v.literal("disconnected"),
    ),
    connectedViaEventId: v.optional(v.id("events")), // Track which event created the connection
    lastMessageAt: v.optional(v.number()), // timestamp for sorting
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_users", ["user1Id", "user2Id"]) // For checking if connection exists
    .index("by_status", ["status"])
    .index("by_last_message", ["lastMessageAt"]),

  // Messages - private messages between connected users
  messages: defineTable({
    connectionId: v.id("connections"),
    senderId: v.id("users"),
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("system"), // For system messages like "Users connected"
    ),
    isRead: v.boolean(),
    imageUrl: v.optional(v.string()), // For image messages
  })
    .index("by_connection", ["connectionId"])
    .index("by_connection_time", ["connectionId", "_creationTime"])
    .index("by_sender", ["senderId"])
    .index("by_unread", ["connectionId", "isRead"]),

  // Message Read Status - track which messages have been seen by which users
  messageReadStatus: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    readAt: v.number(), // timestamp
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "readAt"]),

  // Event Views - track when users view events (for analytics/recommendations)
  eventViews: defineTable({
    eventId: v.id("events"),
    viewerId: v.id("users"),
    viewCount: v.number(), // How many times this user has viewed this event
  })
    .index("by_event", ["eventId"])
    .index("by_viewer", ["viewerId"])
    .index("by_event_viewer", ["eventId", "viewerId"]),

  // Security event logging (keep from original schema but expand for room dates)
  securityEvents: defineTable({
    eventType: v.union(
      v.literal("auth_success"),
      v.literal("auth_failure"),
      v.literal("rate_limit_hit"),
      v.literal("suspicious_activity"),
      v.literal("unauthorized_access"),
      v.literal("room_created"),
      v.literal("event_created"),
      v.literal("application_submitted"),
      v.literal("connection_created"),
      v.literal("message_sent"),
      v.literal("profile_updated"),
    ),
    userId: v.optional(v.id("users")),
    identifier: v.optional(v.string()), // IP, email, etc.
    metadata: v.optional(v.any()), // Additional context (room/event IDs, etc.)
    timestamp: v.number(),
  })
    .index("by_type_time", ["eventType", "timestamp"])
    .index("by_user_time", ["userId", "timestamp"]),
});

export default schema;
