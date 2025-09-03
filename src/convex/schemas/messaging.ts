import { defineTable } from "convex/server";
import { v } from "convex/values";

// Connections - direct relationships between users (created after approved applications)
export const connections = defineTable({
  user1Id: v.id("users"),
  user2Id: v.id("users"),
  status: v.union(
    v.literal("active"),
    v.literal("blocked_by_user1"),
    v.literal("blocked_by_user2"),
    v.literal("disconnected"),
  ),
  connectedViaEventId: v.optional(v.id("events")), // Track which event created the connection
  lastMessageAt: v.optional(v.number()), // timestamp for sorting
  // Denormalized user info for better mobile performance
  user1DisplayName: v.optional(v.string()),
  user2DisplayName: v.optional(v.string()),
  user1ProfileImageUrl: v.optional(v.string()),
  user2ProfileImageUrl: v.optional(v.string()),
})
  .index("by_user1", ["user1Id"])
  .index("by_user2", ["user2Id"])
  .index("by_users", ["user1Id", "user2Id"]) // For checking if connection exists
  .index("by_status", ["status"])
  .index("by_last_message", ["lastMessageAt"])
  .index("by_user1_status", ["user1Id", "status"])
  .index("by_user2_status", ["user2Id", "status"]);

// Messages - private messages between connected users ONLY
export const messages = defineTable({
  connectionId: v.id("connections"),
  senderId: v.id("users"),
  receiverId: v.id("users"), // Add for easier queries
  content: v.string(),
  messageType: v.union(
    v.literal("text"),
    v.literal("image"),
    v.literal("system"), // For system messages like "Users connected"
  ),
  isRead: v.boolean(),
  imageUrl: v.optional(v.string()), // For image messages
  // Denormalized sender info for mobile performance
  senderDisplayName: v.optional(v.string()),
  senderProfileImageUrl: v.optional(v.string()),
})
  .index("by_connection", ["connectionId"])
  .index("by_sender", ["senderId"])
  .index("by_receiver", ["receiverId"])
  .index("by_unread", ["connectionId", "isRead"])
  .index("by_receiver_unread", ["receiverId", "isRead"]);

// Message Read Status - track which messages have been seen by which users
export const messageReadStatus = defineTable({
  messageId: v.id("messages"),
  userId: v.id("users"),
  readAt: v.number(), // timestamp
})
  .index("by_message", ["messageId"])
  .index("by_user", ["userId"])
  .index("by_user_read", ["userId", "readAt"]);

// Event Messages - public messages within event chat rooms
export const eventMessages = defineTable({
  eventId: v.id("events"),
  senderId: v.id("users"),
  content: v.string(),
  messageType: v.union(
    v.literal("text"),
    v.literal("system"), // For system messages like "User joined the event"
  ),
  // Denormalized sender info for better performance
  senderDisplayName: v.string(),
  senderProfileImageUrl: v.optional(v.string()),
})
  .index("by_event", ["eventId"])
  .index("by_sender", ["senderId"]);

// Event Chat Participants - tracks who can participate in event chats
export const eventChatParticipants = defineTable({
  eventId: v.id("events"),
  userId: v.id("users"),
  role: v.union(
    v.literal("owner"), // Event owner
    v.literal("participant"), // Approved event participant
  ),
  joinedAt: v.number(),
  lastSeenAt: v.optional(v.number()), // For tracking read status
})
  .index("by_event", ["eventId"])
  .index("by_user", ["userId"])
  .index("by_event_user", ["eventId", "userId"])
  .index("by_event_role", ["eventId", "role"]);

// Connection Notes - personal notes and nicknames for connections
export const connectionNotes = defineTable({
  connectionId: v.id("connections"),
  userId: v.id("users"), // who created the note (owner of the note)
  nickname: v.optional(v.string()), // custom nickname for the other person
  notes: v.optional(v.string()), // personal notes about the connection
  tags: v.optional(v.array(v.string())), // optional tags like "work", "hobby", "friend"
  lastUpdated: v.number(), // timestamp of last update
})
  .index("by_connection", ["connectionId"])
  .index("by_user", ["userId"])
  .index("by_connection_user", ["connectionId", "userId"]) // unique per connection per user
  .index("by_user_updated", ["userId", "lastUpdated"]); // for sorting by recency

export const messagingSchemas = {
  connections,
  messages,
  messageReadStatus,
  eventMessages,
  eventChatParticipants,
  connectionNotes,
};
