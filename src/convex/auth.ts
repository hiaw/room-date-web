import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { generatePasswordResetEmail } from "./lib/emailTemplates.js";
import { Email } from "@convex-dev/auth/providers/Email";
import Google from "@auth/core/providers/google";
import type { MutationCtx } from "./_generated/server";
import type {
  OAuthProfile,
  ExistingUser,
  UserDataUpdates,
} from "../lib/types/domains/user-types.js";
import { validateAge } from "./lib/ageValidation.js";

// Helper function to build user data from profile
function buildUserDataFromProfile(profile: OAuthProfile): UserDataUpdates {
  const data: UserDataUpdates = {};
  if (profile?.name) data.name = profile.name;
  if (profile?.image) data.image = profile.image;
  if (profile?.email) data.email = profile.email;
  if (profile?.emailVerified) {
    data.emailVerificationTime = Date.now();
  }
  return data;
}

// Helper function to build updates for existing user (enhance principle)
function buildEnhancementUpdates(
  existingUser: ExistingUser,
  profile: OAuthProfile,
): UserDataUpdates {
  const updates: UserDataUpdates = {};

  // Only populate missing fields
  if (!existingUser.name && profile?.name) {
    updates.name = profile.name;
  }
  if (!existingUser.image && profile?.image) {
    updates.image = profile.image;
  }
  // Email is never updated for security reasons (used for account linking)
  if (!existingUser.emailVerificationTime && profile?.emailVerified) {
    updates.emailVerificationTime = Date.now();
  }

  return updates;
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      reset: Email({
        id: "password-reset",
        sendVerificationRequest: async ({ identifier: email, url }) => {
          console.log("Sending password reset email to:", email);
          console.log("Reset URL:", url);

          // Validate required environment variables
          if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set in environment variables");
            throw new Error(
              "Email service is not configured. RESEND_API_KEY is missing.",
            );
          }

          const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
          const appName = process.env.APP_NAME || "Room Dates";

          // Generate email content using templates
          const emailContent = generatePasswordResetEmail({
            appName,
            email,
            url,
          });

          // Resend API call
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: email,
              ...emailContent,
            }),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error("Failed to send email:", error);
            throw new Error(
              `Failed to send password reset email: ${response.status} ${response.statusText}`,
            );
          }

          const result = await response.json();
          console.log("Password reset email sent successfully:", result);
        },
      }),
    }),
    Google,
  ],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      // If this is updating an existing user, handle the update
      if (args.existingUserId !== null) {
        const user = await ctx.db.get(args.existingUserId);
        if (user) {
          // Only populate missing fields (enhance principle)
          const updates = buildEnhancementUpdates(user, args.profile);

          if (Object.keys(updates).length > 0) {
            await ctx.db.patch(args.existingUserId, updates);
          }
        }
        return args.existingUserId;
      }

      // For new sign-ups, validate age if dateOfBirth is provided
      const dateOfBirth = (args.profile as any)?.dateOfBirth;
      const isPasswordSignUp = dateOfBirth !== undefined; // Password signups include DOB, OAuth doesn't

      // For password signups, dateOfBirth is required and validated
      if (isPasswordSignUp) {
        const ageValidation = validateAge(dateOfBirth);
        if (!ageValidation.valid) {
          throw new Error(ageValidation.error || "Age validation failed");
        }
      }
      // OAuth signups will collect DOB during onboarding

      // For new sign-ups, check if a user with this email already exists
      if (args.profile?.email) {
        const existingUser = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", args.profile.email))
          .first();

        if (existingUser) {
          // Update existing user with any missing profile data
          const updates = buildEnhancementUpdates(existingUser, args.profile);

          if (Object.keys(updates).length > 0) {
            await ctx.db.patch(existingUser._id, updates);
          }

          return existingUser._id;
        }
      }

      // Create new user if no existing user found
      // Validate that email exists before creating user
      if (!args.profile?.email) {
        throw new Error("Cannot create a new user without an email address.");
      }

      const userData = buildUserDataFromProfile(args.profile);

      const userId = await ctx.db.insert("users", userData);

      // Auto-create user profile and settings for new users
      const DEFAULT_MAX_DISTANCE_MILES = 25;

      // Parse dateOfBirth if available (only for password signups)
      const profileDateOfBirth = dateOfBirth
        ? new Date(dateOfBirth).getTime()
        : undefined;

      const profilePromise = ctx.db.insert("userProfiles", {
        userId,
        displayName:
          typeof args.profile?.name === "string"
            ? args.profile.name
            : undefined,
        dateOfBirth: profileDateOfBirth,
        bio: undefined,
        profileImageUrl:
          typeof args.profile?.image === "string"
            ? args.profile.image
            : undefined,
        profileImages:
          typeof args.profile?.image === "string"
            ? [args.profile.image]
            : undefined,
        location: undefined,
        latitude: undefined,
        longitude: undefined,
        locationSharing: false,
        isProfileComplete: false,
        isAdmin: false, // New users are not admins by default
      });

      const settingsPromise = ctx.db.insert("userSettings", {
        userId,
        pushNotifications: true,
        emailNotifications: true,
        messageNotifications: true,
        applicationNotifications: true,
        eventReminderNotifications: true,
        ageRangePreference: undefined,
        maxDistance: DEFAULT_MAX_DISTANCE_MILES,
        genderPreferences: undefined,
        theme: "system",
      });

      // Initialize new user with 4 free credits
      const creditsPromise = ctx.db.insert("connectionCredits", {
        userId,
        availableCredits: 4,
        heldCredits: 0,
        totalPurchased: 0,
        totalUsed: 0,
        lastUpdated: Date.now(),
      });

      // Create welcome credit transaction
      const transactionPromise = ctx.db.insert("creditTransactions", {
        userId,
        type: "initial_grant",
        amount: 4,
        description: "Welcome bonus - 4 free credits!",
        timestamp: Date.now(),
      });

      await Promise.all([
        profilePromise,
        settingsPromise,
        creditsPromise,
        transactionPromise,
      ]);

      return userId;
    },
  },
});
