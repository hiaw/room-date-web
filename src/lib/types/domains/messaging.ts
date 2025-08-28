// Messaging and connections domain types
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { UserWithProfile } from "./user-types";

// Connection Types
export type Connection = Doc<"connections">;
export type ConnectionId = Id<"connections">;
export type ConnectionStatus =
  | "active"
  | "blocked_by_user1"
  | "blocked_by_user2"
  | "disconnected";

export interface ConnectionWithUsers extends Connection {
  otherUser?: UserWithProfile;
  unreadCount?: number;
  lastMessage?: Message;
}

// Message Types
export type Message = Doc<"messages">;
export type MessageId = Id<"messages">;
export type MessageType = "text" | "image" | "system";

export interface MessageWithSender extends Message {
  sender?: UserWithProfile;
}

// Message Read Status Types
export type MessageReadStatus = Doc<"messageReadStatus">;

// Form Data Types
export interface CreateMessageData {
  connectionId: ConnectionId;
  content: string;
  messageType?: MessageType;
  imageUrl?: string;
}

export interface MessageFormData {
  connectionId: ConnectionId;
  content: string;
  messageType?: MessageType;
  imageUrl?: string;
}

// Real-time updates
export interface RealtimeUpdate {
  type: "message" | "application" | "connection" | "event";
  data: unknown;
  timestamp: number;
  userId?: string;
}
