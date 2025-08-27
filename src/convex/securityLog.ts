import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export type SecurityEventType =
  | "auth_success"
  | "auth_failure"
  | "rate_limit_hit"
  | "suspicious_activity"
  | "task_created"
  | "unauthorized_access";

/**
 * Log a security event for monitoring and audit purposes
 */
export const logSecurityEvent = mutation({
  args: {
    eventType: v.union(
      v.literal("auth_success"),
      v.literal("auth_failure"),
      v.literal("rate_limit_hit"),
      v.literal("suspicious_activity"),
      v.literal("task_created"),
      v.literal("unauthorized_access"),
    ),
    identifier: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    await ctx.db.insert("securityEvents", {
      eventType: args.eventType,
      userId: userId || undefined,
      identifier: args.identifier,
      metadata: args.metadata,
      timestamp: Date.now(),
    });

    // Also log to console for immediate visibility
    console.log(`Security Event: ${args.eventType}`, {
      userId,
      identifier: args.identifier,
      timestamp: new Date().toISOString(),
      metadata: args.metadata,
    });
  },
});

/**
 * Get recent security events for monitoring
 */
export const getRecentSecurityEvents = query({
  args: {
    eventType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let query = ctx.db.query("securityEvents");

    if (args.eventType) {
      // This would need to be adjusted based on actual eventType filtering
      query = query.filter((q) => q.eq(q.field("eventType"), args.eventType));
    }

    const events = await query.order("desc").take(limit);

    return events;
  },
});

/**
 * Clean up old security events (call this periodically)
 */
export const cleanupOldSecurityEvents = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days ago

    const oldEvents = await ctx.db
      .query("securityEvents")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .collect();

    for (const event of oldEvents) {
      await ctx.db.delete(event._id);
    }

    return { deleted: oldEvents.length };
  },
});
