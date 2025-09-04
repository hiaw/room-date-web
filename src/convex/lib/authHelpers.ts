import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Must be authenticated");
  }
  return userId;
}

export async function optionalAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
  return await getAuthUserId(ctx);
}

/**
 * Check if a user has admin privileges
 */
export async function isAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  const userProfile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  return userProfile?.isAdmin === true;
}

/**
 * Require admin privileges - throws error if user is not admin
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users">> {
  const userId = await requireAuth(ctx);
  const userIsAdmin = await isAdmin(ctx, userId as Id<"users">);

  if (!userIsAdmin) {
    throw new Error("Admin privileges required for this operation");
  }

  return userId as Id<"users">;
}

/**
 * Get current user and check if they are admin (returns both userId and admin status)
 */
export async function getCurrentUserWithAdminStatus(
  ctx: QueryCtx | MutationCtx,
): Promise<{ userId: Id<"users">; isAdmin: boolean }> {
  const userId = await requireAuth(ctx);
  const userIsAdmin = await isAdmin(ctx, userId as Id<"users">);

  return {
    userId: userId as Id<"users">,
    isAdmin: userIsAdmin,
  };
}
