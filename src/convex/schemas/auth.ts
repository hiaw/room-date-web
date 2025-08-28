import { defineTable } from "convex/server";
import { v } from "convex/values";

// User profiles - extends the auth users table with additional info
export const userProfiles = defineTable({
  userId: v.id("users"),
  displayName: v.optional(v.string()),
  dateOfBirth: v.optional(v.number()), // timestamp
  bio: v.optional(v.string()),
  profileImageUrl: v.optional(v.string()),
  profileImages: v.optional(v.array(v.string())), // Multiple profile photos
  location: v.optional(v.string()),
  isProfileComplete: v.boolean(),
  // Geolocation for "users near me" features
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  locationSharing: v.boolean(),
})
  .index("by_user", ["userId"])
  .index("by_location", ["latitude", "longitude"]); // For proximity searches

// User Settings - preferences and notification settings
export const userSettings = defineTable({
  userId: v.id("users"),
  pushNotifications: v.boolean(),
  emailNotifications: v.boolean(),
  messageNotifications: v.boolean(),
  applicationNotifications: v.boolean(),
  eventReminderNotifications: v.boolean(),
  // Age range preferences for event discovery
  ageRangePreference: v.optional(
    v.object({
      min: v.number(),
      max: v.number(),
    }),
  ),
  // Distance preference for event discovery (in miles)
  maxDistance: v.optional(v.number()),
  // Gender preferences for connections
  genderPreferences: v.optional(v.array(v.string())),
  theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
}).index("by_user", ["userId"]);

export const authSchemas = {
  userProfiles,
  userSettings,
};
