import { mutation, query } from "./_generated/server";
import { requireAdmin, isAdmin, requireAuth } from "./lib/authHelpers";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Grant admin role to a user (admin-only operation)
 */
export const grantAdminRole = mutation({
  args: {
    targetUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // CRITICAL: Only existing admins can grant admin role
    const adminUserId = await requireAdmin(ctx);

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    if (userProfile.isAdmin === true) {
      throw new Error("User is already an admin");
    }

    await ctx.db.patch(userProfile._id, { isAdmin: true });

    // Log critical security event
    await ctx.db.insert("securityEvents", {
      eventType: "admin_role_granted",
      userId: adminUserId,
      metadata: {
        targetUserId: args.targetUserId,
        reason: args.reason?.trim() || "No reason provided",
        grantedBy: adminUserId,
      },
      timestamp: Date.now(),
      severity: "critical",
    });

    return { success: true, message: "Admin role granted successfully" };
  },
});

/**
 * Revoke admin role from a user (admin-only operation)
 */
export const revokeAdminRole = mutation({
  args: {
    targetUserId: v.id("users"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // CRITICAL: Only existing admins can revoke admin role
    const adminUserId = await requireAdmin(ctx);

    // Prevent self-revocation (could lock out all admins)
    if (adminUserId === args.targetUserId) {
      throw new Error("Cannot revoke your own admin privileges");
    }

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    if (userProfile.isAdmin !== true) {
      throw new Error("User is not an admin");
    }

    await ctx.db.patch(userProfile._id, { isAdmin: false });

    // Log critical security event
    await ctx.db.insert("securityEvents", {
      eventType: "admin_role_revoked",
      userId: adminUserId,
      metadata: {
        targetUserId: args.targetUserId,
        reason: args.reason?.trim() || "No reason provided",
        revokedBy: adminUserId,
      },
      timestamp: Date.now(),
      severity: "critical",
    });

    return { success: true, message: "Admin role revoked successfully" };
  },
});

/**
 * List all admin users (admin-only operation)
 */
export const listAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    // CRITICAL: Only admins can view list of other admins
    await requireAdmin(ctx);

    const adminProfiles = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("isAdmin"), true))
      .collect();

    // Get user data for each admin
    const admins = await Promise.all(
      adminProfiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        return {
          userId: profile.userId,
          email: user?.email,
          displayName: profile.displayName,
          profileComplete: profile.isProfileComplete,
        };
      }),
    );

    return admins;
  },
});

/**
 * Check if current user is admin (public query for UI purposes)
 */
export const checkCurrentUserAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    try {
      const userId = await requireAuth(ctx);
      const userIsAdmin = await isAdmin(ctx, userId as Id<"users">);
      return {
        isAdmin: userIsAdmin,
        isAuthenticated: true,
        userId: userId,
      };
    } catch {
      // User is not authenticated
      return { isAdmin: false, isAuthenticated: false };
    }
  },
});
