import type { Id } from "../_generated/dataModel";

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface ApplicationWithDetails {
  _id: Id<"eventApplications">;
  eventId: Id<"events">;
  applicantId: Id<"users">;
  status: ApplicationStatus;
  message?: string;
  ownerResponse?: string;
  eventTitle?: string;
  eventStartTime?: number;
  roomTitle: string;
  _creationTime: number;
  applicant?: {
    _id: Id<"users">;
    name?: string;
    email?: string;
    emailVerificationTime?: number;
    image?: string;
    isAnonymous?: boolean;
    profile?: {
      _id: Id<"userProfiles">;
      userId: Id<"users">;
      displayName?: string;
      dateOfBirth?: number;
      bio?: string;
      profileImageUrl?: string;
      profileImages?: string[];
      location?: string;
      isProfileComplete: boolean;
      latitude?: number;
      longitude?: number;
      locationSharing: boolean;
      _creationTime: number;
    } | null;
  };
}

export interface ApplicationWithEvent {
  _id: Id<"eventApplications">;
  eventId: Id<"events">;
  applicantId: Id<"users">;
  status: ApplicationStatus;
  message?: string;
  ownerResponse?: string;
  eventTitle?: string;
  eventStartTime?: number;
  roomTitle: string;
  _creationTime: number;
  event: {
    _id: Id<"events">;
    roomId: Id<"rooms">;
    ownerId: Id<"users">;
    roomTitle: string;
    roomCity?: string;
    roomLatitude?: number;
    roomLongitude?: number;
    title?: string;
    description?: string;
    startTime?: number;
    endTime?: number;
    isFlexibleTiming: boolean;
    maxGuests?: number;
    preferredGender?: string[];
    minAge?: number;
    maxAge?: number;
    category?: string;
    tags?: string[];
    activityLevel?: "low" | "medium" | "high";
    eventImages?: string[];
    primaryEventImageUrl?: string;
    isActive: boolean;
    _creationTime: number;
  };
}
