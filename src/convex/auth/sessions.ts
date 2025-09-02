import { query, mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Get all active sessions for the current user
 */
export const getUserSessions = query({
  handler: async (ctx) => {
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
 * Note: We can't easily identify the "current" session without additional metadata
 * So this revokes all sessions, forcing a re-login
 */
export const revokeAllOtherSessions = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to revoke sessions");
    }

    // Get all sessions for this user
    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    // For simplicity, we'll revoke all sessions (user will need to re-login)
    // In a more sophisticated implementation, you'd track which session is current
    const deletePromises = sessions.map((session) =>
      ctx.db.delete(session._id),
    );

    await Promise.all(deletePromises);

    return {
      success: true,
      revokedCount: deletePromises.length,
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
