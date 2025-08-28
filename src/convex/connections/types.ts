import { v } from "convex/values";

/**
 * Connection status validator
 */
export const connectionStatusValidator = v.union(
  v.literal("active"),
  v.literal("blocked_by_user1"),
  v.literal("blocked_by_user2"),
  v.literal("disconnected"),
);

/**
 * Message type validator
 */
export const messageTypeValidator = v.union(
  v.literal("text"),
  v.literal("image"),
  v.literal("system"),
);

/**
 * Get connections arguments validator
 */
export const getConnectionsArgs = {
  status: v.optional(connectionStatusValidator),
};

/**
 * Get specific connection arguments validator
 */
export const getConnectionArgs = {
  connectionId: v.id("connections"),
};

/**
 * Connection management arguments validator
 */
export const connectionManagementArgs = {
  connectionId: v.id("connections"),
};

/**
 * Send message arguments validator
 */
export const sendMessageArgs = {
  connectionId: v.id("connections"),
  content: v.string(),
  messageType: v.optional(messageTypeValidator),
  imageUrl: v.optional(v.string()),
};

/**
 * Get messages arguments validator
 */
export const getMessagesArgs = {
  connectionId: v.id("connections"),
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
};

/**
 * Mark messages as read arguments validator
 */
export const markMessagesReadArgs = {
  connectionId: v.id("connections"),
};
