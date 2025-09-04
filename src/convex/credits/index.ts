import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

// Get user's current credit balance
export const getCreditBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to get credit balance");
    }

    const creditRecord = await ctx.db
      .query("connectionCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!creditRecord) {
      // Return zero balance if no record exists yet
      return {
        availableCredits: 0,
        heldCredits: 0,
        totalPurchased: 0,
        totalUsed: 0,
      };
    }

    return {
      availableCredits: creditRecord.availableCredits,
      heldCredits: creditRecord.heldCredits,
      totalPurchased: creditRecord.totalPurchased,
      totalUsed: creditRecord.totalUsed,
    };
  },
});

// Get user's credit transaction history
export const getCreditTransactions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to get credit transactions");
    }

    const transactions = await ctx.db
      .query("creditTransactions")
      .withIndex("by_user_timestamp", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 50);

    return transactions;
  },
});

// Get active credit holds for user
export const getActiveCreditHolds = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to get credit holds");
    }

    const holds = await ctx.db
      .query("creditHolds")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", userId).eq("status", "active"),
      )
      .collect();

    return holds;
  },
});

// Initialize credits for new user (4 free credits)
export const initializeUserCredits = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Must be authenticated to initialize credits");
    }

    // Check if user already has credits
    const existing = await ctx.db
      .query("connectionCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      throw new Error("User already has credit record");
    }

    // Create initial credit record
    await ctx.db.insert("connectionCredits", {
      userId: args.userId,
      availableCredits: 4,
      heldCredits: 0,
      totalPurchased: 4, // Count free credits as purchased
      totalUsed: 0,
      lastUpdated: Date.now(),
    });

    // Record the initial grant transaction
    await ctx.db.insert("creditTransactions", {
      userId: args.userId,
      type: "initial_grant",
      amount: 4,
      description: "Welcome bonus - 4 free connection credits",
      timestamp: Date.now(),
    });

    return { success: true, creditsGranted: 4 };
  },
});

// Helper function for holding credits (internal use)
export async function holdCreditsLogic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  userId: Id<"users">,
  eventId: Id<"events">,
  maxGuests: number,
  eventTitle?: string,
) {
  // Get current credit balance
  const creditRecord = await ctx.db
    .query("connectionCredits")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();

  if (!creditRecord) {
    throw new Error("No credit record found for user");
  }

  // Check if user has enough available credits
  if (creditRecord.availableCredits < maxGuests) {
    throw new Error(
      `Insufficient credits. Need ${maxGuests}, have ${creditRecord.availableCredits}`,
    );
  }

  // Create credit hold record
  await ctx.db.insert("creditHolds", {
    userId: userId as Id<"users">,
    eventId: eventId,
    creditsHeld: maxGuests,
    maxGuests: maxGuests,
    creditsUsed: 0,
    status: "active",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Update user's credit balance
  await ctx.db.patch(creditRecord._id, {
    availableCredits: creditRecord.availableCredits - maxGuests,
    heldCredits: creditRecord.heldCredits + maxGuests,
    lastUpdated: Date.now(),
  });

  // Record transaction
  const description = eventTitle
    ? `Credits held for event "${eventTitle}" (${maxGuests} credits)`
    : `Credits held for event (${maxGuests} credits)`;

  await ctx.db.insert("creditTransactions", {
    userId: userId as Id<"users">,
    type: "hold",
    amount: -maxGuests,
    relatedEventId: eventId,
    description,
    timestamp: Date.now(),
  });

  return { success: true, creditsHeld: maxGuests };
}

// Hold credits for event creation
export const holdCreditsForEvent = mutation({
  args: {
    eventId: v.id("events"),
    maxGuests: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to hold credits");
    }

    return await holdCreditsLogic(ctx, userId, args.eventId, args.maxGuests);
  },
});

// Helper function for deducting credits (internal use)
export async function deductCreditLogic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  userId: Id<"users">,
  eventId: Id<"events">,
  applicationId: Id<"eventApplications">,
) {
  // Find the active hold for this event
  const hold = await ctx.db
    .query("creditHolds")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_event", (q: any) => q.eq("eventId", eventId))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((q: any) =>
      q.and(q.eq(q.field("userId"), userId), q.eq(q.field("status"), "active")),
    )
    .unique();

  if (!hold) {
    throw new Error("No active credit hold found for this event");
  }

  // Get user's credit record
  const creditRecord = await ctx.db
    .query("connectionCredits")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();

  if (!creditRecord) {
    throw new Error("No credit record found for user");
  }

  // Update hold record (increment used credits)
  await ctx.db.patch(hold._id, {
    creditsUsed: hold.creditsUsed + 1,
    updatedAt: Date.now(),
  });

  // Update user's credit record (decrease held credits, increase used)
  await ctx.db.patch(creditRecord._id, {
    heldCredits: creditRecord.heldCredits - 1,
    totalUsed: creditRecord.totalUsed + 1,
    lastUpdated: Date.now(),
  });

  // Record transaction
  await ctx.db.insert("creditTransactions", {
    userId: userId as Id<"users">,
    type: "deduction",
    amount: -1,
    relatedEventId: eventId,
    relatedApplicationId: applicationId,
    description: "Credit deducted for approved participant",
    timestamp: Date.now(),
  });

  return { success: true, creditsDeducted: 1 };
}

// Deduct credit when participant is approved
export const deductCreditForApprovedParticipant = mutation({
  args: {
    eventId: v.id("events"),
    applicationId: v.id("eventApplications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to deduct credits");
    }

    return await deductCreditLogic(
      ctx,
      userId,
      args.eventId,
      args.applicationId,
    );
  },
});

// Helper function for releasing credits (internal use)
export async function releaseCreditsLogic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  userId: Id<"users">,
  eventId: Id<"events">,
  customDescription?: string,
  throwOnMissingHold: boolean = true,
) {
  // Find the active hold for this event
  const hold = await ctx.db
    .query("creditHolds")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_event", (q: any) => q.eq("eventId", eventId))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((q: any) =>
      q.and(q.eq(q.field("userId"), userId), q.eq(q.field("status"), "active")),
    )
    .unique();

  if (!hold) {
    if (throwOnMissingHold) {
      throw new Error("No active credit hold found for this event");
    }
    return { success: true, creditsReleased: 0 };
  }

  const creditsToRelease = hold.creditsHeld - hold.creditsUsed;

  if (creditsToRelease > 0) {
    // Get user's credit record
    const creditRecord = await ctx.db
      .query("connectionCredits")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();

    if (!creditRecord) {
      throw new Error("No credit record found for user");
    }

    // Release unused credits back to available
    await ctx.db.patch(creditRecord._id, {
      availableCredits: creditRecord.availableCredits + creditsToRelease,
      heldCredits: creditRecord.heldCredits - creditsToRelease,
      lastUpdated: Date.now(),
    });

    // Record transaction
    const description =
      customDescription ||
      `Credits released from cancelled/expired event (${creditsToRelease} credits)`;

    await ctx.db.insert("creditTransactions", {
      userId: userId as Id<"users">,
      type: "release",
      amount: creditsToRelease,
      relatedEventId: eventId,
      description,
      timestamp: Date.now(),
    });
  }

  // Mark hold as released
  await ctx.db.patch(hold._id, {
    status: "released",
    updatedAt: Date.now(),
  });

  return { success: true, creditsReleased: creditsToRelease };
}

// Release held credits when event is deleted/expired
export const releaseCreditsForEvent = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to release credits");
    }

    return await releaseCreditsLogic(ctx, userId, args.eventId);
  },
});

// Check if user has sufficient credits for event creation
export const checkSufficientCredits = query({
  args: {
    requiredCredits: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to check credits");
    }

    const creditRecord = await ctx.db
      .query("connectionCredits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!creditRecord) {
      return {
        sufficient: false,
        availableCredits: 0,
        requiredCredits: args.requiredCredits,
        shortfall: args.requiredCredits,
      };
    }

    const sufficient = creditRecord.availableCredits >= args.requiredCredits;

    return {
      sufficient,
      availableCredits: creditRecord.availableCredits,
      requiredCredits: args.requiredCredits,
      shortfall: sufficient
        ? 0
        : args.requiredCredits - creditRecord.availableCredits,
    };
  },
});
