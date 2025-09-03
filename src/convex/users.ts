import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getAuthUserId(ctx);
  },
});

export const getUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    return user;
  },
});

// Initialize credits for new user (called after user registration)
export const initializeNewUserCredits = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to initialize credits");
    }

    // Check if user already has credits
    const existing = await ctx.db
      .query("connectionCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      // User already has credits, no need to initialize
      return { success: true, creditsGranted: 0, alreadyExists: true };
    }

    // Create initial credit record with 4 free credits
    await ctx.db.insert("connectionCredits", {
      userId: userId as Id<"users">,
      availableCredits: 4,
      heldCredits: 0,
      totalPurchased: 4, // Count free credits as purchased for tracking
      totalUsed: 0,
      lastUpdated: Date.now(),
    });

    // Record the initial grant transaction
    await ctx.db.insert("creditTransactions", {
      userId: userId as Id<"users">,
      type: "initial_grant",
      amount: 4,
      description: "Welcome bonus - 4 free connection credits ($20 value)",
      timestamp: Date.now(),
    });

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "credits_purchased",
      userId: userId as Id<"users">,
      metadata: {
        creditsGranted: 4,
        type: "initial_grant",
        value: 2000, // $20.00 in cents
      },
      timestamp: Date.now(),
      severity: "low",
    });

    return { success: true, creditsGranted: 4, alreadyExists: false };
  },
});
