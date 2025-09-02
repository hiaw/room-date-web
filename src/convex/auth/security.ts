import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { SecurityActionResult, LoginSecurityResult } from "./types.js";

/**
 * Monitor and respond to suspicious security events
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
    details: v.optional(v.any()),
  },
  handler: async (
    ctx,
    { eventType, details },
  ): Promise<SecurityActionResult> => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return { success: false, actionsTaken: { revokedSessions: false } };

    console.log(`Security Monitor [${userId}]:`, eventType, details);

    let shouldRevokeAllSessions = false;

    // Check for specific suspicious patterns
    switch (eventType) {
      case "multiple_failed_logins":
        // If more than 5 failed attempts, revoke sessions
        shouldRevokeAllSessions = (details?.attemptCount || 0) > 5;
        break;

      case "device_fingerprint_mismatch":
        // If device doesn't match, revoke other sessions
        shouldRevokeAllSessions = true;
        break;

      case "rapid_session_creation":
        // If too many sessions created quickly, might be an attack
        shouldRevokeAllSessions = (details?.sessionCount || 0) > 3;
        break;

      case "token_reuse_detected":
        // Definite sign of compromise - revoke all sessions immediately
        shouldRevokeAllSessions = true;
        break;
    }

    // Take protective actions
    if (shouldRevokeAllSessions) {
      console.log(
        `Revoking all sessions for user ${userId} due to suspicious activity`,
      );

      // Get all sessions for this user and revoke them
      const sessions = await ctx.db
        .query("authSessions")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .collect();

      await Promise.all(sessions.map((session) => ctx.db.delete(session._id)));
    }

    return {
      success: true,
      actionsTaken: {
        revokedSessions: shouldRevokeAllSessions,
      },
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

    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;

    // Count recent session creations
    const recentSessionCount = recentSessions.filter(
      (session) => session._creationTime > fifteenMinutesAgo,
    ).length;

    // Flag as suspicious if too many recent sessions
    const isSuspicious = recentSessionCount > 3;

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
