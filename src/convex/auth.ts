import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import type { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Password, Google],
  callbacks: {
    async createOrUpdateUser(ctx: MutationCtx, args) {
      // If this is updating an existing user, handle the update
      if (args.existingUserId !== null) {
        const updates: any = {};
        if (args.profile?.name) updates.name = args.profile.name;
        if (args.profile?.image) updates.image = args.profile.image;
        if (args.profile?.email) updates.email = args.profile.email;
        if (args.profile?.emailVerified) {
          updates.emailVerificationTime = Date.now();
        }

        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(args.existingUserId, updates);
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
          const updates: any = {};
          if (!existingUser.name && args.profile.name) {
            updates.name = args.profile.name;
          }
          if (!existingUser.image && args.profile.image) {
            updates.image = args.profile.image;
          }
          if (
            !existingUser.emailVerificationTime &&
            args.profile.emailVerified
          ) {
            updates.emailVerificationTime = Date.now();
          }

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
      const userData: any = {};
      if (args.profile?.name) userData.name = args.profile.name;
      if (args.profile?.image) userData.image = args.profile.image;
      if (args.profile?.email) userData.email = args.profile.email;
      if (args.profile?.emailVerified) {
        userData.emailVerificationTime = Date.now();
      }

      const userId = await ctx.db.insert("users", userData);
      console.log(`Created new user: ${args.profile?.email}`);
      return userId;
    },
  },
});
