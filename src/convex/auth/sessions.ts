import { query, mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { SessionRevokeResult, SessionInfo } from "./types.js";

/**
 * Get all active sessions for the current user
 */
export const getUserSessions = query({
  handler: async (ctx): Promise<SessionInfo[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to view sessions");
    }

    // Get all active sessions for this user
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // Return session information (using available fields)
    return sessions.map((session) => ({
      _id: session._id,
      _creationTime: session._creationTime,
      expirationTime: session.expirationTime,
      // For now, we'll use generic device info since userAgent isn't in the schema
      userAgent: "Web Browser", // Could be enhanced by storing in a separate table
      deviceFingerprint: "", // Could be enhanced by storing in a separate table
      lastActivity: session._creationTime,
    }));
  },
});

/**
 * Revoke a specific session
 */
export const revokeSession = mutation({
  args: {
    sessionId: v.id("authSessions"),
  },
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to revoke sessions");
    }

    // Verify the session belongs to the current user
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or access denied");
    }

    // Delete the session
    await ctx.db.delete(sessionId);

    return { success: true };
  },
});

/**
 * Revoke all sessions except the current one
 * Keeps the most recent session active (which should be the current session)
 */
export const revokeAllOtherSessions = mutation({
  handler: async (ctx): Promise<SessionRevokeResult> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to revoke sessions");
    }

    // Get all sessions for this user, ordered by creation time descending
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    // If there's only one session or none, there's nothing to revoke
    if (sessions.length <= 1) {
      return {
        success: true,
        revokedCount: 0,
        message: "No other sessions to revoke",
      };
    }

    // Keep the most recent session (first in desc order) and revoke all others
    const sessionsToRevoke = sessions.slice(1);
    const deletePromises = sessionsToRevoke.map((session) =>
      ctx.db.delete(session._id),
    );

    await Promise.all(deletePromises);

    return {
      success: true,
      revokedCount: sessionsToRevoke.length,
      message: `Successfully revoked ${sessionsToRevoke.length} other session(s)`,
    };
  },
});

/**
 * Log security events for monitoring
 */
export const logSecurityEvent = mutation({
  args: {
    eventType: v.string(),
    details: v.optional(v.any()),
  },
  handler: async (ctx, { eventType, details }) => {
    const userId = await getAuthUserId(ctx);

    // Log security events (in production, you'd want to store these)
    console.log(
      `Security Event [${userId || "anonymous"}]:`,
      eventType,
      details,
    );

    return { success: true };
  },
});
