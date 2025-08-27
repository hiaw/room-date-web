import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get connections for current user
 */
export const getMyConnections = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("blocked_by_user1"),
        v.literal("blocked_by_user2"),
        v.literal("disconnected"),
      ),
    ),
  },
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
      const otherUserId =
        connection.user1Id === userId ? connection.user2Id : connection.user1Id;

      // Get other user info
      const otherUser = await ctx.db.get(otherUserId);
      const otherProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", otherUserId))
        .first();

      // Get unread message count
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_receiver_unread", (q) =>
          q.eq("receiverId", userId).eq("isRead", false),
        )
        .filter((q) => q.eq(q.field("connectionId"), connection._id))
        .collect();

      // Get last message
      const lastMessage = await ctx.db
        .query("messages")
        .withIndex("by_connection", (q) => q.eq("connectionId", connection._id))
        .order("desc")
        .first();

      connectionsWithDetails.push({
        ...connection,
        otherUser: otherUser
          ? {
              ...otherUser,
              profile: otherProfile,
            }
          : undefined,
        unreadCount: unreadMessages.length,
        lastMessage,
      });
    }

    // Sort by last message time, then creation time
    connectionsWithDetails.sort((a, b) => {
      const aTime = a.lastMessageAt || a._creationTime;
      const bTime = b.lastMessageAt || b._creationTime;
      return bTime - aTime;
    });

    return connectionsWithDetails;
  },
});

/**
 * Get a specific connection
 */
export const getConnection = query({
  args: {
    connectionId: v.id("connections"),
  },
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

    const otherUserId =
      connection.user1Id === userId ? connection.user2Id : connection.user1Id;

    // Get other user info
    const otherUser = await ctx.db.get(otherUserId);
    const otherProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", otherUserId))
      .first();

    return {
      ...connection,
      otherUser: otherUser
        ? {
            ...otherUser,
            profile: otherProfile,
          }
        : undefined,
    };
  },
});

/**
 * Block a connection
 */
export const blockConnection = mutation({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to block connections");
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    // User must be part of this connection
    if (connection.user1Id !== userId && connection.user2Id !== userId) {
      throw new Error("Access denied to this connection");
    }

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
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to unblock connections");
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    // User must be part of this connection
    if (connection.user1Id !== userId && connection.user2Id !== userId) {
      throw new Error("Access denied to this connection");
    }

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
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to disconnect");
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    // User must be part of this connection
    if (connection.user1Id !== userId && connection.user2Id !== userId) {
      throw new Error("Access denied to this connection");
    }

    await ctx.db.patch(args.connectionId, { status: "disconnected" });

    return args.connectionId;
  },
});

/**
 * Send a message between connected users
 */
export const sendMessage = mutation({
  args: {
    connectionId: v.id("connections"),
    content: v.string(),
    messageType: v.optional(
      v.union(v.literal("text"), v.literal("image"), v.literal("system")),
    ),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to send messages");
    }

    // Validate message content
    if (!args.content.trim() && args.messageType !== "image") {
      throw new Error("Message content cannot be empty");
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    // User must be part of this connection
    if (connection.user1Id !== userId && connection.user2Id !== userId) {
      throw new Error("Access denied to this connection");
    }

    // Connection must be active (not blocked or disconnected)
    if (connection.status !== "active") {
      throw new Error("Cannot send message to inactive connection");
    }

    const receiverId =
      connection.user1Id === userId ? connection.user2Id : connection.user1Id;

    // Get sender profile for denormalized data
    const senderProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Create message
    const messageId = await ctx.db.insert("messages", {
      connectionId: args.connectionId,
      senderId: userId,
      receiverId,
      content: args.content.trim(),
      messageType: args.messageType || "text",
      isRead: false,
      imageUrl: args.imageUrl,
      // Denormalized sender info
      senderDisplayName: senderProfile?.displayName,
      senderProfileImageUrl: senderProfile?.profileImageUrl,
    });

    // Update connection with last message time
    await ctx.db.patch(args.connectionId, {
      lastMessageAt: Date.now(),
    });

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "message_sent",
      userId,
      metadata: {
        messageId,
        connectionId: args.connectionId,
        receiverId,
        messageType: args.messageType || "text",
        hasImage: !!args.imageUrl,
      },
      timestamp: Date.now(),
      severity: "low",
    });

    return messageId;
  },
});

/**
 * Get messages for a connection
 */
export const getMessages = query({
  args: {
    connectionId: v.id("connections"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { messages: [], nextCursor: null };
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      return { messages: [], nextCursor: null };
    }

    // User must be part of this connection
    if (connection.user1Id !== userId && connection.user2Id !== userId) {
      throw new Error("Access denied to this connection");
    }

    const limit = args.limit || 50;

    const query = ctx.db
      .query("messages")
      .withIndex("by_connection", (q) =>
        q.eq("connectionId", args.connectionId),
      )
      .order("desc");

    // Handle pagination cursor
    if (args.cursor) {
      // In a real implementation, you'd decode the cursor to continue from that point
      // For now, we'll use simple offset-based pagination
    }

    const messages = await query.take(limit);

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      nextCursor: messages.length === limit ? "more" : null, // Simplified cursor
    };
  },
});

/**
 * Mark messages as read
 */
export const markMessagesAsRead = mutation({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to mark messages as read");
    }

    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    // User must be part of this connection
    if (connection.user1Id !== userId && connection.user2Id !== userId) {
      throw new Error("Access denied to this connection");
    }

    // Get unread messages for this user
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_receiver_unread", (q) =>
        q.eq("receiverId", userId).eq("isRead", false),
      )
      .filter((q) => q.eq(q.field("connectionId"), args.connectionId))
      .collect();

    // Mark them as read
    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, { isRead: true });
    }

    return { markedCount: unreadMessages.length };
  },
});

/**
 * Get user connections (alias for getMyConnections)
 */
export const getUserConnections = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("blocked_by_user1"),
        v.literal("blocked_by_user2"),
        v.literal("blocked_by_both"),
      ),
    ),
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

    // Get detailed connection info with user profiles
    const connectionsWithDetails = [];
    for (const connection of filteredConnections) {
      // Determine the other user
      const otherUserId =
        connection.user1Id === userId ? connection.user2Id : connection.user1Id;

      // Get other user info
      const otherUser = await ctx.db.get(otherUserId);
      const otherUserProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", otherUserId))
        .first();

      // Get last message in this connection
      const lastMessage = await ctx.db
        .query("messages")
        .withIndex("by_connection", (q) => q.eq("connectionId", connection._id))
        .order("desc")
        .first();

      // Count unread messages
      const unreadCount = await ctx.db
        .query("messages")
        .withIndex("by_connection", (q) => q.eq("connectionId", connection._id))
        .filter((q) =>
          q.and(
            q.neq(q.field("senderId"), userId),
            q.eq(q.field("isRead"), false),
          ),
        )
        .collect();

      connectionsWithDetails.push({
        ...connection,
        otherUser: otherUser
          ? {
              ...otherUser,
              profile: otherUserProfile,
            }
          : null,
        lastMessage,
        unreadCount: unreadCount.length,
      });
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
      // Determine the other user
      const otherUserId =
        connection.user1Id === userId ? connection.user2Id : connection.user1Id;

      // Get other user info
      const otherUser = await ctx.db.get(otherUserId);
      const otherUserProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", otherUserId))
        .first();

      // Get last message
      const lastMessage = await ctx.db
        .query("messages")
        .withIndex("by_connection", (q) => q.eq("connectionId", connection._id))
        .order("desc")
        .first();

      // Count unread messages
      const unreadCount = await ctx.db
        .query("messages")
        .withIndex("by_connection", (q) => q.eq("connectionId", connection._id))
        .filter((q) =>
          q.and(
            q.neq(q.field("senderId"), userId),
            q.eq(q.field("isRead"), false),
          ),
        )
        .collect();

      conversations.push({
        connectionId: connection._id,
        otherUser: otherUser
          ? {
              ...otherUser,
              profile: otherUserProfile,
            }
          : null,
        lastMessage,
        unreadCount: unreadCount.length,
        lastActivity: lastMessage?._creationTime || connection._creationTime,
      });
    }

    // Sort by last activity
    return conversations.sort((a, b) => b.lastActivity - a.lastActivity);
  },
});
