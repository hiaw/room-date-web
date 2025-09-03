import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

// Get user's payment history
export const getPaymentHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to get payment history");
    }

    const payments = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 25);

    return payments;
  },
});

// Create payment record for Stripe transaction
export const createPaymentTransaction = mutation({
  args: {
    providerTransactionId: v.string(),
    amount: v.number(),
    currency: v.string(),
    creditsToGrant: v.number(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create payment transaction");
    }

    // Check if transaction already exists
    const existing = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_provider_transaction", (q) =>
        q
          .eq("provider", "stripe")
          .eq("providerTransactionId", args.providerTransactionId),
      )
      .unique();

    if (existing) {
      throw new Error("Payment transaction already exists");
    }

    // Create payment transaction record
    const paymentId = await ctx.db.insert("paymentTransactions", {
      userId: userId as Id<"users">,
      provider: "stripe",
      providerTransactionId: args.providerTransactionId,
      amount: args.amount,
      currency: args.currency,
      creditsGranted: args.creditsToGrant,
      status: "pending",
      metadata: {
        stripePaymentIntentId: args.stripePaymentIntentId,
        stripeCustomerId: args.stripeCustomerId,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return paymentId;
  },
});

// Complete payment and grant credits
export const completePayment = mutation({
  args: {
    paymentTransactionId: v.id("paymentTransactions"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentTransactionId);
    if (!payment) {
      throw new Error("Payment transaction not found");
    }

    if (payment.status !== "pending") {
      throw new Error("Payment is not in pending status");
    }

    // Update payment status
    await ctx.db.patch(args.paymentTransactionId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // Get or create user's credit record
    let creditRecord = await ctx.db
      .query("connectionCredits")
      .withIndex("by_user", (q) => q.eq("userId", payment.userId))
      .unique();

    if (!creditRecord) {
      // Create initial credit record
      const creditId = await ctx.db.insert("connectionCredits", {
        userId: payment.userId,
        availableCredits: payment.creditsGranted,
        heldCredits: 0,
        totalPurchased: payment.creditsGranted,
        totalUsed: 0,
        lastUpdated: Date.now(),
      });

      creditRecord = await ctx.db.get(creditId);
    } else {
      // Update existing record
      await ctx.db.patch(creditRecord._id, {
        availableCredits:
          creditRecord.availableCredits + payment.creditsGranted,
        totalPurchased: creditRecord.totalPurchased + payment.creditsGranted,
        lastUpdated: Date.now(),
      });
    }

    // Record credit transaction
    await ctx.db.insert("creditTransactions", {
      userId: payment.userId,
      type: "purchase",
      amount: payment.creditsGranted,
      paymentTransactionId: args.paymentTransactionId,
      description: `Purchased ${payment.creditsGranted} credits for $${(payment.amount / 100).toFixed(2)}`,
      timestamp: Date.now(),
    });

    return { success: true, creditsGranted: payment.creditsGranted };
  },
});

// Fail payment transaction
export const failPayment = mutation({
  args: {
    paymentTransactionId: v.id("paymentTransactions"),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.paymentTransactionId);
    if (!payment) {
      throw new Error("Payment transaction not found");
    }

    // Update payment status
    await ctx.db.patch(args.paymentTransactionId, {
      status: "failed",
      metadata: {
        ...payment.metadata,
        failureReason: args.failureReason,
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get payment transaction by provider ID (for webhook processing)
export const getPaymentByProviderTransactionId = query({
  args: {
    provider: v.union(v.literal("stripe")),
    providerTransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_provider_transaction", (q) =>
        q
          .eq("provider", args.provider)
          .eq("providerTransactionId", args.providerTransactionId),
      )
      .unique();

    return payment;
  },
});
