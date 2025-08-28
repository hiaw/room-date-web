import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { connectionManagementArgs } from "./types.js";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * Helper function to validate connection access
 */
async function validateConnectionAccess(
  ctx: MutationCtx,
  connectionId: Id<"connections">,
  userId: Id<"users">,
) {
  const connection = await ctx.db.get(connectionId);
  if (!connection) {
    throw new Error("Connection not found");
  }

  // User must be part of this connection
  if (connection.user1Id !== userId && connection.user2Id !== userId) {
    throw new Error("Access denied to this connection");
  }

  return connection;
}

/**
 * Block a connection
 */
export const blockConnection = mutation({
  args: connectionManagementArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to block connections");
    }

    const connection = await validateConnectionAccess(
      ctx,
      args.connectionId,
      userId,
    );

    // Determine new status based on who is blocking
    const newStatus =
      connection.user1Id === userId ? "blocked_by_user1" : "blocked_by_user2";

    await ctx.db.patch(args.connectionId, { status: newStatus });

    return args.connectionId;
  },
});

/**
 * Unblock a connection
 */
export const unblockConnection = mutation({
  args: connectionManagementArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to unblock connections");
    }

    const connection = await validateConnectionAccess(
      ctx,
      args.connectionId,
      userId,
    );

    // Only allow unblocking if current user was the one who blocked
    const userIsBlocker =
      (connection.user1Id === userId &&
        connection.status === "blocked_by_user1") ||
      (connection.user2Id === userId &&
        connection.status === "blocked_by_user2");

    if (!userIsBlocker) {
      throw new Error("Can only unblock connections you blocked");
    }

    await ctx.db.patch(args.connectionId, { status: "active" });

    return args.connectionId;
  },
});

/**
 * Disconnect from a user (soft delete)
 */
export const disconnectUser = mutation({
  args: connectionManagementArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to disconnect");
    }

    await validateConnectionAccess(ctx, args.connectionId, userId);

    await ctx.db.patch(args.connectionId, { status: "disconnected" });

    return args.connectionId;
  },
});
