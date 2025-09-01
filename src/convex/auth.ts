import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
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
  includeEmail = false,
): UserDataUpdates {
  const updates: UserDataUpdates = {};

  // Only populate missing fields
  if (!existingUser.name && profile?.name) {
    updates.name = profile.name;
  }
  if (!existingUser.image && profile?.image) {
    updates.image = profile.image;
  }
  if (includeEmail && !existingUser.email && profile?.email) {
    updates.email = profile.email;
  }
  if (!existingUser.emailVerificationTime && profile?.emailVerified) {
    updates.emailVerificationTime = Date.now();
  }

  return updates;
}

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password, Google],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      // If this is updating an existing user, handle the update
      if (args.existingUserId !== null) {
        const user = await ctx.db.get(args.existingUserId);
        if (user) {
          // Only populate missing fields (enhance principle)
          // Don't include email as it's used for account linking
          const updates = buildEnhancementUpdates(user, args.profile, false);

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
          const updates = buildEnhancementUpdates(
            existingUser,
            args.profile,
            false,
          );

          if (Object.keys(updates).length > 0) {
            await ctx.db.patch(existingUser._id, updates);
          }

          console.log(
            `Linking ${args.provider.id} account to existing user: ${existingUser.email}`,
          );
          return existingUser._id;
        }
      }

      // Create new user if no existing user found
      const userData = buildUserDataFromProfile(args.profile);

      const userId = await ctx.db.insert("users", userData);
      console.log(`Created new user: ${args.profile?.email}`);
      return userId;
    },
  },
});
