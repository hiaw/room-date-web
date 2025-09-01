// User and Authentication domain types
import type { Doc, Id } from "../../../convex/_generated/dataModel";

// User Types
export type User = Doc<"users">;
export type UserId = Id<"users">;

export type UserProfile = Doc<"userProfiles">;
export type UserProfileId = Id<"userProfiles">;

export interface UserWithProfile extends Doc<"users"> {
  profile?: UserProfile;
  displayName?: string;
}

export type UserSettings = Doc<"userSettings">;
export type UserSettingsId = Id<"userSettings">;

// Auth Form Data Types
export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
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

// OAuth and Account Linking Types
export interface OAuthProfile {
  name?: string;
  image?: string;
  email?: string;
  emailVerified?: boolean;
}

// User data structure for OAuth profile updates
export interface UserDataUpdates {
  name?: string;
  image?: string;
  email?: string;
  emailVerificationTime?: number;
}

// Alias for existing user data (same structure as updates)
export type ExistingUser = UserDataUpdates;

// Auth Token Types
export interface AuthTokens {
  token: string;
  refreshToken: string;
}

// Security Types
export type SecurityEvent = Doc<"securityEvents">;
export type SecuritySeverity = "low" | "medium" | "high" | "critical";

// Component Props
export interface AuthFormProps {
  onSubmit: (email: string, password: string, name?: string) => Promise<void>;
  isSignUp?: boolean;
  loading?: boolean;
  error?: string | null;
}

// Push Notification Types
export type PushNotificationToken = Doc<"pushNotificationTokens">;
export type Platform = "ios" | "android" | "web";

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
