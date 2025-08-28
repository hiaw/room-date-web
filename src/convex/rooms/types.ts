import type { Id } from "../_generated/dataModel";

export interface RoomWithOwner {
  _id: Id<"rooms">;
  ownerId: Id<"users">;
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
  locationVerified: boolean;
  images?: string[];
  primaryImageUrl?: string;
  isActive: boolean;
  _creationTime: number;
  owner?: {
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

export interface CreateRoomArgs {
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

export interface UpdateRoomArgs {
  roomId: Id<"rooms">;
  title?: string;
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

export interface LocationFilter {
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  radiusInMiles?: number;
  limit?: number;
}
