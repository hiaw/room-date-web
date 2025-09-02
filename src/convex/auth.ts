import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import Google from "@auth/core/providers/google";
import type { MutationCtx } from "./_generated/server";
import type {
  OAuthProfile,
  ExistingUser,
  UserDataUpdates,
} from "../lib/types/domains/user-types.js";

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

          const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";
          const appName = process.env.APP_NAME || "Room Dates";

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
              subject: `Reset your ${appName} password`,
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #1a202c; margin: 0;">${appName}</h1>
                  </div>
                  
                  <h2 style="color: #2d3748; margin-bottom: 16px;">Reset Your Password</h2>
                  
                  <p style="color: #4a5568; line-height: 1.6; margin-bottom: 24px;">
                    We received a request to reset the password for your ${appName} account associated with ${email}.
                  </p>
                  
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #3182ce; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Reset Password
                    </a>
                  </div>
                  
                  <p style="color: #718096; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
                    If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                  
                  <p style="color: #718096; font-size: 14px; line-height: 1.6;">
                    This link will expire in 24 hours for security reasons.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                  
                  <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                    This is an automated email from ${appName}. Please do not reply to this email.
                  </p>
                </div>
              `,
              text: `
Reset your ${appName} password

We received a request to reset the password for your ${appName} account associated with ${email}.

Click the link below to reset your password:
${url}

If you didn't request this password reset, you can safely ignore this email.

This link will expire in 24 hours for security reasons.
              `.trim(),
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

      const profilePromise = ctx.db.insert("userProfiles", {
        userId,
        displayName:
          typeof args.profile?.name === "string"
            ? args.profile.name
            : undefined,
        dateOfBirth: undefined,
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

      await Promise.all([profilePromise, settingsPromise]);

      return userId;
    },
  },
});
