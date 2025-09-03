import { mutation, query, action } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import Stripe from "stripe";

// Create Stripe Checkout Session (ACTION - allows external API calls)
export const createCheckoutSession = action({
  args: {
    credits: v.number(),
    amount: v.number(), // Amount in cents
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create checkout session");
    }

    // Validate environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error(
        "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.",
      );
    }

    try {
      // Initialize Stripe with secret key
      const stripe = new Stripe(stripeSecretKey);

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: args.currency,
              product_data: {
                name: `${args.credits} Credits`,
                description: `Purchase ${args.credits} credits for Room Dates`,
              },
              unit_amount: args.amount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.SITE_URL || "http://localhost:5174"}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.SITE_URL || "http://localhost:5174"}/credits?cancelled=true`,
        metadata: {
          userId: userId,
          credits: args.credits.toString(),
          type: "credit_purchase",
        },
      });

      // Return checkout session data
      return {
        success: true,
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("Stripe error:", error);
      throw new Error(
        `Checkout session creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});

// Create payment intent for Stripe checkout (ACTION - allows external API calls) - DEPRECATED
export const createPaymentIntent = action({
  args: {
    credits: v.number(),
    amount: v.number(), // Amount in cents
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create payment intent");
    }

    // Validate environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error(
        "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.",
      );
    }

    try {
      // Initialize Stripe with secret key
      const stripe = new Stripe(stripeSecretKey);

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: args.amount,
        currency: args.currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: userId,
          credits: args.credits.toString(),
          type: "credit_purchase",
        },
      });

      // Return payment intent data - we'll create the payment record later via webhook or frontend
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error("Stripe error:", error);
      throw new Error(
        `Payment setup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});

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
    const creditRecord = await ctx.db
      .query("connectionCredits")
      .withIndex("by_user", (q) => q.eq("userId", payment.userId))
      .unique();

    if (!creditRecord) {
      // Create initial credit record
      await ctx.db.insert("connectionCredits", {
        userId: payment.userId,
        availableCredits: payment.creditsGranted,
        heldCredits: 0,
        totalPurchased: payment.creditsGranted,
        totalUsed: 0,
        lastUpdated: Date.now(),
      });
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

// Complete payment by payment intent ID (called from frontend after successful payment)
export const completePaymentByIntentId = mutation({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    // Find the payment transaction by payment intent ID
    const payment = await ctx.db
      .query("paymentTransactions")
      .filter((q) =>
        q.eq(q.field("metadata.stripePaymentIntentId"), args.paymentIntentId),
      )
      .first();

    if (!payment) {
      // Create the payment record if it doesn't exist
      // This handles the case where the payment was successful but we haven't recorded it yet
      await ctx.db.insert("paymentTransactions", {
        userId: userId as Id<"users">,
        provider: "stripe",
        providerTransactionId: args.paymentIntentId,
        amount: 0, // Will be updated when we have more info
        currency: "usd",
        creditsGranted: 0, // Will be updated when we have more info
        status: "completed",
        metadata: {
          stripePaymentIntentId: args.paymentIntentId,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      return {
        success: true,
        message: "Payment recorded, credits will be granted via webhook",
      };
    }

    if (payment.status === "completed") {
      return { success: true, message: "Payment already processed" };
    }

    // Complete the payment using the completePayment function
    await ctx.db.patch(payment._id, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // Get or create user's credit record
    const creditRecord = await ctx.db
      .query("connectionCredits")
      .withIndex("by_user", (q) => q.eq("userId", payment.userId))
      .unique();

    if (!creditRecord) {
      // Create initial credit record
      await ctx.db.insert("connectionCredits", {
        userId: payment.userId,
        availableCredits: payment.creditsGranted,
        heldCredits: 0,
        totalPurchased: payment.creditsGranted,
        totalUsed: 0,
        lastUpdated: Date.now(),
      });
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
      paymentTransactionId: payment._id,
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
