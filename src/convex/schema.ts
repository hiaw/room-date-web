import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const schema = defineSchema({
  ...authTables,
  // Tasks table for todo functionality
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    userId: v.optional(v.id("users")), // Optional link to user
  }),

  // Security event logging (authAttempts removed)
  securityEvents: defineTable({
    eventType: v.union(
      v.literal("auth_success"),
      v.literal("auth_failure"),
      v.literal("rate_limit_hit"),
      v.literal("suspicious_activity"),
      v.literal("task_created"),
      v.literal("unauthorized_access"),
    ),
    userId: v.optional(v.id("users")),
    identifier: v.optional(v.string()), // IP, email, etc.
    metadata: v.optional(v.any()), // Additional context
    timestamp: v.number(),
  })
    .index("by_type_time", ["eventType", "timestamp"])
    .index("by_user_time", ["userId", "timestamp"]),
});

export default schema;
