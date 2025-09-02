import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { SecurityActionResult, LoginSecurityResult } from "./types.js";
import {
  SECURITY_THRESHOLDS,
  SecurityUtils,
} from "../lib/securityConstants.js";

/**
 * Monitor and respond to suspicious security events
 * Handles both authenticated and pre-authentication security events
 */
export const monitorSecurityEvent = mutation({
  args: {
    eventType: v.union(
      v.literal("multiple_failed_logins"),
      v.literal("device_fingerprint_mismatch"),
      v.literal("rapid_session_creation"),
      v.literal("token_reuse_detected"),
      v.literal("suspicious_login_pattern"),
      v.literal("account_lockout"),
      v.literal("password_breach_detected"),
      v.literal("unusual_location_access"),
    ),
    deviceFingerprint: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    details: v.optional(
      v.object({
        attemptCount: v.optional(v.number()),
        sessionCount: v.optional(v.number()),
        email: v.optional(v.string()), // For pre-auth events
        userId: v.optional(v.id("users")), // Explicit user ID for pre-auth events
        ipAddress: v.optional(v.string()),
        location: v.optional(v.string()),
        timestamp: v.optional(v.number()),
        riskScore: v.optional(v.number()),
      }),
    ),
  },
  handler: async (
    ctx,
    { eventType, deviceFingerprint, userAgent, details },
  ): Promise<SecurityActionResult> => {
    // Try to get authenticated user first
    const authenticatedUserId = await getAuthUserId(ctx);

    // For pre-authentication events, use the provided user ID or email to identify user
    let targetUserId = authenticatedUserId;

    if (!authenticatedUserId && details) {
      // Handle pre-authentication events
      if (details.userId) {
        targetUserId = details.userId;
      } else if (details.email) {
        // Look up user by email for pre-auth events
        const user = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", details.email))
          .first();
        if (user) {
          targetUserId = user._id;
        }
      }
    }

    // Log the security event regardless of authentication status
    console.log(
      `Security Monitor [${targetUserId || "unauthenticated"}]:`,
      eventType,
      {
        ...details,
        deviceFingerprint,
        userAgent,
        timestamp: Date.now(),
      },
    );

    // If we can't identify a user, we can still log but can't take user-specific actions
    if (!targetUserId) {
      return {
        success: true,
        actionsTaken: { revokedSessions: false },
        message: "Security event logged for unidentified user",
      };
    }

    let shouldRevokeAllSessions = false;

    // Check for specific suspicious patterns
    switch (eventType) {
      case "multiple_failed_logins":
        // If more than the threshold of failed attempts, revoke sessions
        shouldRevokeAllSessions =
          (details?.attemptCount || 0) > SECURITY_THRESHOLDS.MAX_FAILED_LOGINS;
        break;

      case "device_fingerprint_mismatch":
        // If device doesn't match, revoke other sessions
        shouldRevokeAllSessions = true;
        break;

      case "rapid_session_creation":
        // If too many sessions created quickly, might be an attack
        shouldRevokeAllSessions =
          (details?.sessionCount || 0) > SECURITY_THRESHOLDS.MAX_RAPID_SESSIONS;
        break;

      case "token_reuse_detected":
        // Definite sign of compromise - revoke all sessions immediately
        shouldRevokeAllSessions = true;
        break;

      case "account_lockout":
        // Account lockout - revoke all sessions
        shouldRevokeAllSessions = true;
        break;

      case "password_breach_detected":
        // Potential compromise - revoke all sessions
        shouldRevokeAllSessions = true;
        break;
    }

    // Take protective actions
    if (shouldRevokeAllSessions) {
      console.log(
        `Revoking all sessions for user ${targetUserId} due to suspicious activity: ${eventType}`,
      );

      // Get all sessions for this user and revoke them
      const sessions = await ctx.db
        .query("authSessions")
        .withIndex("userId", (q) => q.eq("userId", targetUserId))
        .collect();

      await Promise.all(sessions.map((session) => ctx.db.delete(session._id)));
    }

    return {
      success: true,
      actionsTaken: {
        revokedSessions: shouldRevokeAllSessions,
      },
      message: shouldRevokeAllSessions
        ? `Revoked ${shouldRevokeAllSessions ? "all" : "no"} sessions due to ${eventType}`
        : `Security event ${eventType} logged and monitored`,
    };
  },
});

/**
 * Check for suspicious login patterns
 */
export const checkLoginSecurity = mutation({
  args: {
    deviceFingerprint: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { deviceFingerprint, userAgent },
  ): Promise<LoginSecurityResult> => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return {
        isSuspicious: false,
        recentSessionCount: 0,
        recommendedAction: "allow",
      };

    // Get user's recent sessions to analyze patterns
    const recentSessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // Calculate time window for recent session analysis
    const timeWindowAgo = SecurityUtils.getTimeWindowStart("rapid_session");

    // Count recent session creations within the security time window
    const recentSessionCount = recentSessions.filter(
      (session) => session._creationTime > timeWindowAgo,
    ).length;

    // Flag as suspicious if too many recent sessions
    const isSuspicious =
      recentSessionCount > SECURITY_THRESHOLDS.MAX_SESSIONS_IN_WINDOW;

    if (isSuspicious) {
      console.log(`Suspicious activity detected for user ${userId}:`, {
        eventType: "rapid_session_creation",
        sessionCount: recentSessionCount,
        deviceFingerprint,
        userAgent,
      });

      // Revoke all sessions as a protective measure
      await Promise.all(
        recentSessions.map((session) => ctx.db.delete(session._id)),
      );
    }

    return {
      isSuspicious,
      recentSessionCount,
      recommendedAction: isSuspicious ? "verify_identity" : "allow",
    };
  },
});
