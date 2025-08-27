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
    profileImages: v.optional(v.array(v.string())), // Multiple profile photos
    location: v.optional(v.string()),
    isProfileComplete: v.boolean(),
    // Geolocation for "users near me" features
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationSharing: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_location", ["latitude", "longitude"]), // For proximity searches

  // User Settings - preferences and notification settings
  userSettings: defineTable({
    userId: v.id("users"),
    pushNotifications: v.boolean(),
    emailNotifications: v.boolean(),
    messageNotifications: v.boolean(),
    applicationNotifications: v.boolean(),
    eventReminderNotifications: v.boolean(),
    // Age range preferences for event discovery
    ageRangePreference: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
      }),
    ),
    // Distance preference for event discovery (in miles)
    maxDistance: v.optional(v.number()),
    // Gender preferences for connections
    genderPreferences: v.optional(v.array(v.string())),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
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
    // Geolocation for "events near me"
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationVerified: v.boolean(),
    // Media support
    images: v.optional(v.array(v.string())), // Room photo URLs
    primaryImageUrl: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_active", ["isActive"])
    .index("by_city", ["city"])
    .index("by_location", ["latitude", "longitude"]) // For geospatial queries
    .index("by_active_location", ["isActive", "latitude", "longitude"]),

  // Events - time-based gatherings hosted within rooms
  events: defineTable({
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
    .index("by_city_active", ["roomCity", "isActive"]),

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
    // Denormalize event info for better mobile UX
    eventTitle: v.optional(v.string()),
    eventStartTime: v.optional(v.number()),
    roomTitle: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_applicant", ["applicantId"])
    .index("by_status", ["status"])
    .index("by_event_status", ["eventId", "status"])
    .index("by_applicant_status", ["applicantId", "status"])
    .index("by_applicant_time", ["applicantId", "_creationTime"]),

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
    // Denormalized user info for better mobile performance
    user1DisplayName: v.optional(v.string()),
    user2DisplayName: v.optional(v.string()),
    user1ProfileImageUrl: v.optional(v.string()),
    user2ProfileImageUrl: v.optional(v.string()),
  })
    .index("by_user1", ["user1Id"])
    .index("by_user2", ["user2Id"])
    .index("by_users", ["user1Id", "user2Id"]) // For checking if connection exists
    .index("by_status", ["status"])
    .index("by_last_message", ["lastMessageAt"])
    .index("by_user1_status", ["user1Id", "status"])
    .index("by_user2_status", ["user2Id", "status"]),

  // Messages - private messages between connected users ONLY
  messages: defineTable({
    connectionId: v.id("connections"),
    senderId: v.id("users"),
    receiverId: v.id("users"), // Add for easier queries
    content: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("system"), // For system messages like "Users connected"
    ),
    isRead: v.boolean(),
    imageUrl: v.optional(v.string()), // For image messages
    // Denormalized sender info for mobile performance
    senderDisplayName: v.optional(v.string()),
    senderProfileImageUrl: v.optional(v.string()),
  })
    .index("by_connection", ["connectionId"])
    .index("by_connection_time", ["connectionId", "_creationTime"])
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"])
    .index("by_unread", ["connectionId", "isRead"])
    .index("by_receiver_unread", ["receiverId", "isRead"]),

  // Message Read Status - track which messages have been seen by which users
  messageReadStatus: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    readAt: v.number(), // timestamp
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "readAt"]),

  // Event Bookmarks/Favorites - users can save events for later
  eventBookmarks: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    // Denormalized event info for quick access
    eventTitle: v.optional(v.string()),
    roomTitle: v.string(),
    eventStartTime: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_user_time", ["userId", "_creationTime"]),

  // Event Views - track when users view events (for analytics/recommendations)
  eventViews: defineTable({
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
    .index("by_viewer_time", ["viewerId", "lastViewedAt"]),

  // Push Notification Tokens - for mobile push notifications
  pushNotificationTokens: defineTable({
    userId: v.id("users"),
    token: v.string(), // FCM token or similar
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
    isActive: v.boolean(),
    lastUsed: v.number(), // timestamp
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"])
    .index("by_user_active", ["userId", "isActive"]),

  // Security event logging (expanded for room dates features)
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
      v.literal("location_accessed"),
      v.literal("image_uploaded"),
      v.literal("spam_detected"),
    ),
    userId: v.optional(v.id("users")),
    identifier: v.optional(v.string()), // IP, email, etc.
    metadata: v.optional(v.any()), // Additional context (room/event IDs, etc.)
    timestamp: v.number(),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical"),
    ),
  })
    .index("by_type_time", ["eventType", "timestamp"])
    .index("by_user_time", ["userId", "timestamp"])
    .index("by_severity", ["severity", "timestamp"]),
});

export default schema;
