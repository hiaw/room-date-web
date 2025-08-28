import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  sendMessageArgs,
  getMessagesArgs,
  markMessagesReadArgs,
} from "./types.js";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/**
 * Helper function to validate connection access and status
 */
async function validateActiveConnection(
  ctx: MutationCtx | QueryCtx,
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
 * Send a message between connected users
 */
export const sendMessage = mutation({
  args: sendMessageArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to send messages");
    }

    // Validate message content
    if (!args.content.trim() && args.messageType !== "image") {
      throw new Error("Message content cannot be empty");
    }

    const connection = await validateActiveConnection(
      ctx,
      args.connectionId,
      userId,
    );

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
      userId: userId as Id<"users">,
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
  args: getMessagesArgs,
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
  args: markMessagesReadArgs,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to mark messages as read");
    }

    await validateActiveConnection(ctx, args.connectionId, userId);

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
