import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get a user's profile
 */
export const getUserProfile = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    const targetUserId = args.userId || currentUserId;

    if (!targetUserId) {
      return null;
    }

    // Get the user record
    const user = await ctx.db.get(targetUserId);
    if (!user) return null;

    // Get the profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", targetUserId))
      .first();

    // Get settings if viewing own profile
    let settings = null;
    if (currentUserId === targetUserId) {
      settings = await ctx.db
        .query("userSettings")
        .withIndex("by_user", (q) => q.eq("userId", targetUserId))
        .first();
    }

    return {
      user,
      profile,
      settings,
    };
  },
});

/**
 * Create or update user profile
 */
export const updateUserProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    profileImages: v.optional(v.array(v.string())),
    location: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    locationSharing: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update profile");
    }

    // Check if profile exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Determine if profile is complete
    const isProfileComplete = !!(
      (args.displayName || existingProfile?.displayName) &&
      (args.dateOfBirth || existingProfile?.dateOfBirth) &&
      (args.bio || existingProfile?.bio)
    );

    const profileData = {
      userId,
      displayName: args.displayName,
      dateOfBirth: args.dateOfBirth,
      bio: args.bio,
      profileImageUrl: args.profileImageUrl,
      profileImages: args.profileImages,
      location: args.location,
      latitude: args.latitude,
      longitude: args.longitude,
      locationSharing: args.locationSharing ?? false,
      isProfileComplete,
    };

    let profileId;
    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        ...Object.fromEntries(
          Object.entries(profileData).filter(
            ([, value]) => value !== undefined,
          ),
        ),
      });
      profileId = existingProfile._id;
    } else {
      // Create new profile
      profileId = await ctx.db.insert("userProfiles", profileData);
    }

    // Log security event directly
    await ctx.db.insert("securityEvents", {
      eventType: "profile_updated",
      userId,
      metadata: {
        profileId,
        fieldsUpdated: Object.keys(args).filter(
          (key) => args[key as keyof typeof args] !== undefined,
        ),
        isNewProfile: !existingProfile,
      },
      timestamp: Date.now(),
      severity: "low",
    });

    return profileId;
  },
});

/**
 * Create or update user settings
 */
export const updateUserSettings = mutation({
  args: {
    pushNotifications: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
    messageNotifications: v.optional(v.boolean()),
    applicationNotifications: v.optional(v.boolean()),
    eventReminderNotifications: v.optional(v.boolean()),
    ageRangePreference: v.optional(
      v.object({
        min: v.number(),
        max: v.number(),
      }),
    ),
    maxDistance: v.optional(v.number()),
    genderPreferences: v.optional(v.array(v.string())),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update settings");
    }

    // Check if settings exist
    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const settingsData = {
      userId,
      pushNotifications: args.pushNotifications ?? true,
      emailNotifications: args.emailNotifications ?? true,
      messageNotifications: args.messageNotifications ?? true,
      applicationNotifications: args.applicationNotifications ?? true,
      eventReminderNotifications: args.eventReminderNotifications ?? true,
      ageRangePreference: args.ageRangePreference,
      maxDistance: args.maxDistance,
      genderPreferences: args.genderPreferences,
      theme: args.theme ?? "system",
    };

    let settingsId;
    if (existingSettings) {
      // Update existing settings
      await ctx.db.patch(existingSettings._id, {
        ...Object.fromEntries(
          Object.entries(settingsData).filter(
            ([, value]) => value !== undefined,
          ),
        ),
      });
      settingsId = existingSettings._id;
    } else {
      // Create new settings
      settingsId = await ctx.db.insert("userSettings", settingsData);
    }

    return settingsId;
  },
});

/**
 * Get users near a location (for "users near me" features)
 */
export const getUsersNearby = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusInMiles: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }

    const radiusInMiles = args.radiusInMiles || 25;
    const limit = args.limit || 20;

    // Get all profiles with location sharing enabled
    // Note: In a production app, you'd want to implement proper geospatial queries
    // For now, we'll fetch profiles and filter in-memory
    const profiles = await ctx.db
      .query("userProfiles")
      .withIndex("by_location")
      .filter((q) =>
        q.and(
          q.neq(q.field("userId"), currentUserId),
          q.eq(q.field("locationSharing"), true),
          q.neq(q.field("latitude"), undefined),
          q.neq(q.field("longitude"), undefined),
        ),
      )
      .take(100); // Get more than needed, then filter by distance

    // Calculate distances and filter
    const nearbyProfiles = profiles
      .map((profile) => {
        const distance = calculateDistance(
          args.latitude,
          args.longitude,
          profile.latitude!,
          profile.longitude!,
        );
        return { profile, distance };
      })
      .filter((item) => item.distance <= radiusInMiles)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    // Get user data for each profile
    const results = [];
    for (const item of nearbyProfiles) {
      const user = await ctx.db.get(item.profile.userId);
      if (user) {
        results.push({
          user,
          profile: item.profile,
          distance: item.distance,
        });
      }
    }

    return results;
  },
});

/**
 * Delete user profile and all associated data
 */
export const deleteUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to delete profile");
    }

    // Delete profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      await ctx.db.delete(profile._id);
    }

    // Delete settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (settings) {
      await ctx.db.delete(settings._id);
    }

    // Note: In a production app, you might want to anonymize rather than delete
    // to preserve referential integrity for rooms, events, etc.

    return { success: true };
  },
});

/**
 * Helper function to calculate distance between two points in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
