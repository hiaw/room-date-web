import { defineTable } from "convex/server";
import { v } from "convex/values";

// Push Notification Tokens - for mobile push notifications
export const pushNotificationTokens = defineTable({
  userId: v.id("users"),
  token: v.string(), // FCM token or similar
  platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
  isActive: v.boolean(),
  lastUsed: v.number(), // timestamp
})
  .index("by_user", ["userId"])
  .index("by_token", ["token"])
  .index("by_user_active", ["userId", "isActive"]);

// Security event logging (expanded for room dates features)
export const securityEvents = defineTable({
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
  severity: v.optional(
    v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical"),
    ),
  ),
})
  .index("by_type_time", ["eventType", "timestamp"])
  .index("by_user_time", ["userId", "timestamp"])
  .index("by_severity", ["severity", "timestamp"]);

export const systemSchemas = {
  pushNotificationTokens,
  securityEvents,
};
