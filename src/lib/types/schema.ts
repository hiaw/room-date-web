import type { Doc, Id } from "../../convex/_generated/dataModel";

// User Profile Types
export type UserProfile = Doc<"userProfiles">;
export type UserProfileId = Id<"userProfiles">;

export interface UserWithProfile extends Doc<"users"> {
  profile?: UserProfile;
}

// Room Types
export type Room = Doc<"rooms">;
export type RoomId = Id<"rooms">;

export interface RoomWithOwner extends Room {
  owner?: UserWithProfile;
}

// Event Types
export type Event = Doc<"events">;
export type EventId = Id<"events">;

export interface EventWithDetails extends Event {
  room?: Room;
  owner?: UserWithProfile;
  applicationCount?: number;
  pendingApplicationCount?: number;
  userApplication?: EventApplication; // Current user's application if any
}

// Application Types
export type EventApplication = Doc<"eventApplications">;
export type EventApplicationId = Id<"eventApplications">;
export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface EventApplicationWithDetails extends EventApplication {
  applicant?: UserWithProfile;
  event?: EventWithDetails;
}

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

// Event Views Types
export type EventView = Doc<"eventViews">;

// Security Types
export type SecurityEvent = Doc<"securityEvents">;

// Form Data Types (for creating/updating entities)
export interface CreateRoomData {
  title: string;
  description?: string;
  address?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UpdateRoomData extends Partial<CreateRoomData> {
  isActive?: boolean;
}

export interface CreateEventData {
  roomId: RoomId;
  title?: string;
  description?: string;
  startTime?: number;
  endTime?: number;
  isFlexibleTiming: boolean;
  maxGuests?: number;
  preferredGender?: string[];
  minAge?: number;
  maxAge?: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  isActive?: boolean;
}

export interface CreateApplicationData {
  eventId: EventId;
  message?: string;
}

export interface UpdateApplicationData {
  status: ApplicationStatus;
  ownerResponse?: string;
}

export interface CreateMessageData {
  connectionId: ConnectionId;
  content: string;
  messageType?: MessageType;
  imageUrl?: string;
}

export interface UpdateProfileData {
  displayName?: string;
  dateOfBirth?: number;
  bio?: string;
  profileImageUrl?: string;
  location?: string;
}

// Utility Types
export interface PaginationResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface SearchFilters {
  city?: string;
  state?: string;
  minAge?: number;
  maxAge?: number;
  preferredGender?: string[];
  hasFlexibleTiming?: boolean;
  startDateAfter?: number;
  startDateBefore?: number;
}

// Mobile/UI specific types
export interface MobileViewport {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
}

export interface NavigationState {
  currentTab: "explore" | "rooms" | "connections" | "profile";
  previousTab?: string;
  canGoBack: boolean;
}
