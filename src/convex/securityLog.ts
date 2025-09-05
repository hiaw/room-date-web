import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SECURITY_THRESHOLDS, SecurityUtils } from "./lib/securityConstants.js";

export type SecurityEventType =
  | "auth_success"
  | "auth_failure"
  | "rate_limit_hit"
  | "suspicious_activity"
  | "unauthorized_access"
  | "room_created"
  | "event_created"
  | "application_submitted"
  | "connection_created"
  | "message_sent"
  | "profile_updated"
  | "dob_change_attempt"
  | "location_accessed"
  | "image_uploaded"
  | "spam_detected";

export type SecuritySeverity = "low" | "medium" | "high" | "critical";

/**
 * Log a security event for monitoring and audit purposes
 * Enhanced to trigger security monitoring for suspicious patterns
 */
export const logSecurityEvent = mutation({
  args: {
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
      v.literal("dob_change_attempt"),
      v.literal("location_accessed"),
      v.literal("image_uploaded"),
      v.literal("spam_detected"),
    ),
    identifier: v.optional(v.string()), // Usually email for auth events
    metadata: v.optional(v.any()),
    severity: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    // Determine severity if not provided
    const severity = args.severity || getDefaultSeverity(args.eventType);

    // Log the security event
    await ctx.db.insert("securityEvents", {
      eventType: args.eventType,
      userId: userId || undefined,
      identifier: args.identifier,
      metadata: args.metadata,
      timestamp: Date.now(),
      severity,
    });

    // For auth failures, check for patterns and trigger security monitoring
    if (args.eventType === "auth_failure" && args.identifier) {
      await checkAndTriggerSecurityMonitoring(ctx, args.identifier);
    }
  },
});

/**
 * Check for suspicious patterns and trigger security monitoring
 */
async function checkAndTriggerSecurityMonitoring(
  ctx: MutationCtx,
  email: string,
) {
  // Get recent auth failures for this email/identifier
  const recentFailures = await ctx.db
    .query("securityEvents")
    .filter((q) => q.eq(q.field("eventType"), "auth_failure"))
    .filter((q) => q.eq(q.field("identifier"), email))
    .filter((q) =>
      q.gt(
        q.field("timestamp"),
        SecurityUtils.getTimeWindowStart("failed_login"),
      ),
    )
    .collect();

  const attemptCount = recentFailures.length;

  // If we have reached the threshold for failed attempts, trigger security monitoring
  if (attemptCount >= SECURITY_THRESHOLDS.MIN_FAILED_LOGINS_FOR_MONITORING) {
    try {
      // Import the security monitoring function
      const { monitorSecurityEvent } = await import("./auth/security.js");

      // Use type assertion to work around Convex type complexity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.runMutation(monitorSecurityEvent as any, {
        eventType: "multiple_failed_logins",
        details: {
          email: email,
          attemptCount: attemptCount,
          timestamp: Date.now(),
          riskScore: SecurityUtils.calculateRiskScore(attemptCount),
        },
      });

      console.log(
        `Triggered security monitoring for ${email} after ${attemptCount} failed attempts`,
      );
    } catch (error) {
      console.error("Failed to trigger security monitoring:", error);
    }
  }
}

/**
 * Get recent security events for monitoring
 */
export const getRecentSecurityEvents = query({
  args: {
    eventType: v.optional(v.string()),
    severity: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let query = ctx.db.query("securityEvents");

    if (args.eventType) {
      query = query.filter((q) => q.eq(q.field("eventType"), args.eventType));
    }

    if (args.severity) {
      query = query.filter((q) => q.eq(q.field("severity"), args.severity));
    }

    const events = await query.order("desc").take(limit);

    return events;
  },
});

/**
 * Get security statistics
 */
export const getSecurityStats = query({
  args: {},
  handler: async (ctx) => {
    const recentEvents = await ctx.db
      .query("securityEvents")
      .filter((q) =>
        q.gt(q.field("timestamp"), Date.now() - 24 * 60 * 60 * 1000),
      ) // Last 24 hours
      .collect();

    const stats = {
      total: recentEvents.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      criticalCount: 0,
    };

    for (const event of recentEvents) {
      stats.byType[event.eventType] = (stats.byType[event.eventType] || 0) + 1;

      if (event.severity) {
        stats.bySeverity[event.severity] =
          (stats.bySeverity[event.severity] || 0) + 1;

        if (event.severity === "critical") {
          stats.criticalCount++;
        }
      }
    }

    return stats;
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

/**
 * Helper function to determine default severity for event types
 */
function getDefaultSeverity(eventType: SecurityEventType): SecuritySeverity {
  const severityMap: Record<SecurityEventType, SecuritySeverity> = {
    auth_success: "low",
    auth_failure: "medium",
    rate_limit_hit: "medium",
    suspicious_activity: "high",
    unauthorized_access: "high",
    room_created: "low",
    event_created: "low",
    application_submitted: "low",
    connection_created: "low",
    message_sent: "low",
    profile_updated: "low",
    dob_change_attempt: "high",
    location_accessed: "medium",
    image_uploaded: "low",
    spam_detected: "high",
  };

  return severityMap[eventType] || "medium";
}
