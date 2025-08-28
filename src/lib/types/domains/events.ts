// Events domain types
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { Room, RoomId } from "./rooms";
import type { UserWithProfile } from "./user-types";

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

// Bookmark Types
export type EventBookmark = Doc<"eventBookmarks">;
export type EventBookmarkId = Id<"eventBookmarks">;

// Event Views Types
export type EventView = Doc<"eventViews">;

// Form Data Types
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

export interface EventFormData {
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

export interface CreateApplicationData {
  eventId: EventId;
  message?: string;
}

export interface UpdateApplicationData {
  status: ApplicationStatus;
  ownerResponse?: string;
}

export interface ApplicationFormData {
  eventId: EventId;
  message?: string;
}

// Component-specific Event Data
export interface EventData {
  _id: string;
  title?: string;
  description?: string;
  suggestedTimes?: Date[];
  isFlexibleTiming?: boolean;
  maxGuests?: number;
  preferredGender?: string[];
  minAge?: number;
  maxAge?: number;
  roomTitle?: string;
  roomDescription?: string;
  roomCity?: string;
  roomState?: string;
  hostName?: string;
  hostAge?: number;
  distanceMiles?: number;
  applicantCount?: number;
  _creationTime: number;
  // Additional fields from Convex queries
  applicationCount?: number;
  pendingApplicationCount?: number;
  distance?: number;
  roomLatitude?: number;
  roomLongitude?: number;
  startTime?: number;
  endTime?: number;
  category?: string;
  activityLevel?: "low" | "medium" | "high";
  tags?: string[];
  primaryEventImageUrl?: string;
  eventImages?: string[];
  hostImageUrl?: string;
}

// Search and Filter Types
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
