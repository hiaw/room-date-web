import type { Doc, Id } from "../../convex/_generated/dataModel";

// User Profile Types
export type UserProfile = Doc<"userProfiles">;
export type UserProfileId = Id<"userProfiles">;

export interface UserWithProfile extends Doc<"users"> {
  profile?: UserProfile;
  displayName?: string; // From profile or user
}

// User Settings Types
export type UserSettings = Doc<"userSettings">;
export type UserSettingsId = Id<"userSettings">;

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
  isBookmarked?: boolean;
}

// Time slot for flexible events
export interface TimeSlot {
  startTime: number;
  endTime: number;
  label?: string;
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

// Bookmark Types
export type EventBookmark = Doc<"eventBookmarks">;
export type EventBookmarkId = Id<"eventBookmarks">;

// Event Views Types
export type EventView = Doc<"eventViews">;

// Push Notification Types
export type PushNotificationToken = Doc<"pushNotificationTokens">;
export type Platform = "ios" | "android" | "web";

// Message Read Status Types
export type MessageReadStatus = Doc<"messageReadStatus">;

// Security Types
export type SecurityEvent = Doc<"securityEvents">;
export type SecuritySeverity = "low" | "medium" | "high" | "critical";

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
  latitude?: number;
  longitude?: number;
  locationVerified?: boolean;
  images?: string[];
  primaryImageUrl?: string;
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
  suggestedTimeSlots?: TimeSlot[];
  maxGuests?: number;
  preferredGender?: string[];
  minAge?: number;
  maxAge?: number;
  eventImages?: string[];
  primaryEventImageUrl?: string;
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
  profileImages?: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  locationSharing?: boolean;
}

export interface UpdateSettingsData {
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  messageNotifications?: boolean;
  applicationNotifications?: boolean;
  eventReminderNotifications?: boolean;
  ageRangePreference?: {
    min: number;
    max: number;
  };
  maxDistance?: number;
  genderPreferences?: string[];
  theme?: "light" | "dark" | "system";
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
  maxDistance?: number; // in miles
  userLatitude?: number; // for distance calculations
  userLongitude?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
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

// Geospatial types for "events near me"
export interface DistanceResult<T> {
  data: T;
  distance: number; // in miles
}

export interface BoundingBox {
  minLatitude: number;
  maxLatitude: number;
  minLongitude: number;
  maxLongitude: number;
}

// Analytics and insights
export interface UserInsights {
  totalRoomsCreated: number;
  totalEventsHosted: number;
  totalApplicationsSent: number;
  totalApplicationsReceived: number;
  totalConnections: number;
  averageEventAttendance: number;
  preferredEventTypes: string[];
  mostActiveHours: number[];
  lastActiveAt: number;
}

// Real-time updates
export interface RealtimeUpdate {
  type: "message" | "application" | "connection" | "event";
  data: any;
  timestamp: number;
  userId?: string;
}
