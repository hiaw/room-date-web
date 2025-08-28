import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getConnectionsArgs, getConnectionArgs } from "./types.js";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

/**
 * Helper function to get connection details with other user info
 */
async function getConnectionWithDetails(
  ctx: QueryCtx,
  connection: Doc<"connections">,
  currentUserId: Id<"users">,
  includeMessages = false,
) {
  const otherUserId =
    connection.user1Id === currentUserId
      ? connection.user2Id
      : connection.user1Id;

  // Get other user info
  const otherUser = await ctx.db.get(otherUserId);
  const otherProfile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", otherUserId))
    .first();

  let unreadCount = 0;
  let lastMessage = null;

  if (includeMessages) {
    // Get unread message count
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver_unread", (q) =>
        q.eq("receiverId", currentUserId).eq("isRead", false),
      )
      .filter((q) => q.eq(q.field("connectionId"), connection._id))
      .collect();
    unreadCount = unreadMessages.length;

    // Get last message
    lastMessage = await ctx.db
      .query("messages")
      .withIndex("by_connection", (q) => q.eq("connectionId", connection._id))
      .order("desc")
      .first();
  }

  return {
    ...connection,
    otherUser: otherUser
      ? {
          ...otherUser,
          profile: otherProfile,
        }
      : undefined,
    unreadCount,
    lastMessage,
  };
}

/**
 * Get connections for current user
 */
export const getMyConnections = query({
  args: getConnectionsArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get connections where user is either user1 or user2
    const connections1 = await ctx.db
      .query("connections")
      .withIndex("by_user1_status", (q) =>
        args.status
          ? q.eq("user1Id", userId).eq("status", args.status)
          : q.eq("user1Id", userId),
      )
      .collect();

    const connections2 = await ctx.db
      .query("connections")
      .withIndex("by_user2_status", (q) =>
        args.status
          ? q.eq("user2Id", userId).eq("status", args.status)
          : q.eq("user2Id", userId),
      )
      .collect();

    const allConnections = [...connections1, ...connections2];

    // Get details for each connection
    const connectionsWithDetails = [];
    for (const connection of allConnections) {
      const detailed = await getConnectionWithDetails(
        ctx,
        connection,
        userId,
        true,
      );
      connectionsWithDetails.push(detailed);
    }

    // Sort by last message time, then creation time
    connectionsWithDetails.sort((a, b) => {
      const aTime = a.lastMessage?._creationTime || a._creationTime;
      const bTime = b.lastMessage?._creationTime || b._creationTime;
      return bTime - aTime;
    });

    return connectionsWithDetails;
  },
});

/**
 * Get a specific connection
 */
export const getConnection = query({
  args: getConnectionArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      return null;
    }

    // User must be part of this connection
    if (connection.user1Id !== userId && connection.user2Id !== userId) {
      throw new Error("Access denied to this connection");
    }

    return await getConnectionWithDetails(ctx, connection, userId, false);
  },
});

/**
 * Get user connections (enhanced version of getMyConnections)
 */
export const getUserConnections = query({
  args: {
    status: getConnectionsArgs.status,
    includeDisconnected: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const query = ctx.db.query("connections");

    // Filter by user
    const connections = await query
      .filter((q) =>
        q.or(
          q.eq(q.field("user1Id"), userId),
          q.eq(q.field("user2Id"), userId),
        ),
      )
      .collect();

    // Apply status filter
    let filteredConnections = connections;
    if (args.status) {
      filteredConnections = connections.filter(
        (conn) => conn.status === args.status,
      );
    } else if (!args.includeDisconnected) {
      // Default: exclude disconnected connections
      filteredConnections = connections.filter(
        (conn) => conn.status !== "disconnected",
      );
    }

    // Get detailed connection info
    const connectionsWithDetails = [];
    for (const connection of filteredConnections) {
      const detailed = await getConnectionWithDetails(
        ctx,
        connection,
        userId,
        true,
      );
      connectionsWithDetails.push(detailed);
    }

    // Sort by last activity (most recent first)
    return connectionsWithDetails.sort((a, b) => {
      const aTime = a.lastMessage?._creationTime || a._creationTime;
      const bTime = b.lastMessage?._creationTime || b._creationTime;
      return bTime - aTime;
    });
  },
});

/**
 * Get user conversations (simplified view of connections for messaging)
 */
export const getUserConversations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get active connections only
    const connections = await ctx.db
      .query("connections")
      .filter((q) =>
        q.and(
          q.or(
            q.eq(q.field("user1Id"), userId),
            q.eq(q.field("user2Id"), userId),
          ),
          q.eq(q.field("status"), "active"),
        ),
      )
      .collect();

    const conversations = [];
    for (const connection of connections) {
      const detailed = await getConnectionWithDetails(
        ctx,
        connection,
        userId,
        true,
      );

      conversations.push({
        connectionId: connection._id,
        otherUser: detailed.otherUser,
        lastMessage: detailed.lastMessage,
        unreadCount: detailed.unreadCount,
        lastActivity:
          detailed.lastMessage?._creationTime || connection._creationTime,
      });
    }

    // Sort by last activity
    return conversations.sort((a, b) => b.lastActivity - a.lastActivity);
  },
});
