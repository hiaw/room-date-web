import type { Doc, Id } from "../../../convex/_generated/dataModel";

export type UserProfile = Doc<"userProfiles">;
export type UserProfileId = Id<"userProfiles">;

export interface UserWithProfile extends Doc<"users"> {
  profile?: UserProfile;
  displayName?: string;
}

export type UserSettings = Doc<"userSettings">;
export type UserSettingsId = Id<"userSettings">;
