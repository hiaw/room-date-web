import {
  mutation,
  query,
  action,
  type MutationCtx,
} from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id, Doc } from "../_generated/dataModel";
import Stripe from "stripe";

// Helper function for granting credits and creating transaction record
async function grantCreditsForPayment(
  ctx: MutationCtx,
  payment: Doc<"paymentTransactions">,
  customDescription?: string,
) {
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
      availableCredits: creditRecord.availableCredits + payment.creditsGranted,
      totalPurchased: creditRecord.totalPurchased + payment.creditsGranted,
      lastUpdated: Date.now(),
    });
  }

  // Record credit transaction
  const description =
    customDescription ||
    `Purchased ${payment.creditsGranted} credits for $${(payment.amount / 100).toFixed(2)}`;

  await ctx.db.insert("creditTransactions", {
    userId: payment.userId,
    type: "purchase",
    amount: payment.creditsGranted,
    paymentTransactionId: payment._id,
    description,
    timestamp: Date.now(),
  });

  return { success: true, creditsGranted: payment.creditsGranted };
}

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

    // Grant credits using shared logic
    return await grantCreditsForPayment(ctx, payment);
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

    // Update payment status
    await ctx.db.patch(payment._id, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // Grant credits using shared logic
    return await grantCreditsForPayment(ctx, payment);
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
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Securely process payment after Stripe redirect with server-side verification
export const processStripeRedirect = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to process payment");
    }

    // Validate session ID format
    if (!args.sessionId.startsWith("cs_")) {
      throw new Error("Invalid session ID format");
    }

    // Initialize Stripe with secret key for server-side verification
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured");
    }

    try {
      const stripe = new Stripe(stripeSecretKey);

      // SECURITY: Verify session with Stripe API server-side
      const session = await stripe.checkout.sessions.retrieve(args.sessionId);

      // Verify session belongs to current user and is paid
      if (session.metadata?.userId !== userId) {
        throw new Error("Session does not belong to authenticated user");
      }

      if (session.payment_status !== "paid") {
        throw new Error("Payment not completed");
      }

      if (!session.metadata?.credits) {
        throw new Error("Session missing credits metadata");
      }

      const credits = parseInt(session.metadata.credits);

      // Since this is an action and we've verified the payment with Stripe,
      // we can safely trust this payment is legitimate and process it directly
      return {
        success: true,
        creditsGranted: credits,
        message: `Payment verified! ${credits} credits will be processed immediately.`,
        sessionId: session.id,
        userId: userId,
      };
    } catch (error) {
      console.error("Stripe session verification failed:", error);
      throw new Error(
        `Payment verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
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

// Internal function to process Stripe webhook events

// Complete payment by session ID (simpler approach for session-based payments)
export const completePaymentBySessionId = mutation({
  args: {
    sessionId: v.string(),
    credits: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    // Check if payment record already exists
    const existingPayment = await ctx.db
      .query("paymentTransactions")
      .withIndex("by_provider_transaction", (q) =>
        q.eq("provider", "stripe").eq("providerTransactionId", args.sessionId),
      )
      .unique();

    let paymentRecord;

    if (!existingPayment) {
      // Create the payment record
      const paymentId = await ctx.db.insert("paymentTransactions", {
        userId: userId as Id<"users">,
        provider: "stripe",
        providerTransactionId: args.sessionId,
        amount: args.credits * 500, // Estimate based on credits (will be updated by webhook if needed)
        currency: "usd",
        creditsGranted: args.credits,
        status: "pending",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      paymentRecord = await ctx.db.get(paymentId);
    } else {
      paymentRecord = existingPayment;
    }

    if (!paymentRecord) {
      throw new Error("Failed to create payment record");
    }

    // If payment is already completed, return success
    if (paymentRecord.status === "completed") {
      return {
        success: true,
        creditsGranted: args.credits,
        message: "Payment already processed",
      };
    }

    // Complete the payment and grant credits
    await ctx.db.patch(paymentRecord._id, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // Grant credits using the helper function
    await grantCreditsForPayment(ctx, paymentRecord);

    return {
      success: true,
      creditsGranted: args.credits,
      message: "Credits granted successfully",
    };
  },
});
