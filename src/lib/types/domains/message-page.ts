// Types specific to the direct messaging page (/messages/[id])
import type { Id } from "../../../convex/_generated/dataModel";
import type { Message, ConnectionWithUsers } from "./messaging";

// Route Parameters
export interface MessagePageParams {
  id: Id<"connections">;
}

// Component State Types
export interface MessagePageState {
  messageText: string;
  isSubmitting: boolean;
  messagesContainer: HTMLDivElement | null;
}

// Query Result Types (derived from Convex responses)
export interface MessagesQueryResult {
  messages: Message[];
  nextCursor: string | null;
}

export interface ConnectionQueryResult extends ConnectionWithUsers {
  _id: Id<"connections">;
}

// UI Helper Types
export interface MessageTimeFormatOptions {
  showDate?: boolean;
  showTime?: boolean;
  relative?: boolean;
}

// Event Handler Types
export type MessageSubmitHandler = () => Promise<void>;
export type MessageKeyDownHandler = (event: KeyboardEvent) => void;
export type NavigationHandler = () => void;

// Message Display Types
export interface MessageDisplayProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export interface MessageBubbleVariant {
  variant: "sent" | "received";
  content: string;
  timestamp: number;
  imageUrl?: string;
  senderName?: string;
  senderAvatar?: string;
}

// Loading States
export interface MessagePageLoadingState {
  messages: boolean;
  connection: boolean;
  sending: boolean;
}

// Error States
export interface MessagePageErrorState {
  connection: string | null;
  messages: string | null;
  sending: string | null;
}
