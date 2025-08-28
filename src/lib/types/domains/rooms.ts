// Rooms domain types
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { UserWithProfile } from "./user-types";

// Room Types
export type Room = Doc<"rooms">;
export type RoomId = Id<"rooms">;

export interface RoomWithOwner extends Room {
  owner?: UserWithProfile;
}

// Form Data Types
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

export interface RoomFormData {
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

// Location Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface GeolocationPosition {
  coords: Coordinates;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: 1;
  POSITION_UNAVAILABLE: 2;
  TIMEOUT: 3;
}

// Geospatial types
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
