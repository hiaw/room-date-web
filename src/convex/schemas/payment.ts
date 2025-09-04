import { defineTable } from "convex/server";
import { v } from "convex/values";

export const paymentSchemas = {
  // Connection credits balance and transaction history
  connectionCredits: defineTable({
    userId: v.id("users"),
    availableCredits: v.number(), // Credits available for use
    heldCredits: v.number(), // Credits held for active events
    totalPurchased: v.number(), // Total credits ever purchased
    totalUsed: v.number(), // Total credits ever used
    lastUpdated: v.number(), // Timestamp of last update
  }).index("by_user", ["userId"]),

  // Individual credit transactions (purchases, usage, refunds)
  creditTransactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("purchase"), // Bought credits
      v.literal("deduction"), // Used credit for approved participant
      v.literal("refund"), // Refund for no-show
      v.literal("initial_grant"), // Free credits for new users
      v.literal("hold"), // Credit held for event creation
      v.literal("release"), // Credit released from hold
    ),
    amount: v.number(), // Number of credits (positive for gains, negative for losses)
    relatedEventId: v.optional(v.id("events")), // Event that triggered this transaction
    relatedApplicationId: v.optional(v.id("eventApplications")), // Application that triggered this
    paymentTransactionId: v.optional(v.id("paymentTransactions")), // Related payment record
    description: v.string(), // Human readable description
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_event", ["relatedEventId"]),

  // Credit holds for active events
  creditHolds: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    creditsHeld: v.number(), // Number of credits held
    maxGuests: v.number(), // Max guests for this event
    creditsUsed: v.number(), // Credits actually deducted (for approved participants)
    status: v.union(
      v.literal("active"), // Event is active, credits are held
      v.literal("released"), // Event deleted/expired, credits released
      v.literal("released"), // Event deleted/expired, credits released
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_status", ["status"]),

  // Payment transactions with external payment providers
  paymentTransactions: defineTable({
    userId: v.id("users"),
    provider: v.union(v.literal("stripe")), // Payment provider
    providerTransactionId: v.string(), // Provider's transaction ID
    providerCustomerId: v.optional(v.string()), // Provider's customer ID
    amount: v.number(), // Amount in cents
    currency: v.string(), // Currency code (e.g., "usd")
    creditsGranted: v.number(), // Number of credits granted
    status: v.union(
      v.literal("pending"), // Payment initiated
      v.literal("completed"), // Payment successful
      v.literal("failed"), // Payment failed
      v.literal("cancelled"), // Payment cancelled
      v.literal("refunded"), // Payment refunded
    ),
    metadata: v.optional(
      v.object({
        stripePaymentIntentId: v.optional(v.string()),
        stripeCustomerId: v.optional(v.string()),
        failureReason: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_provider_transaction", ["provider", "providerTransactionId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"]),

  // Refund requests for no-show participants
  refundRequests: defineTable({
    userId: v.id("users"), // User requesting refund
    eventId: v.id("events"), // Event where no-show occurred
    applicationId: v.id("eventApplications"), // Application that was approved
    participantUserId: v.id("users"), // User who didn't show up
    creditsToRefund: v.number(), // Number of credits to refund (usually 1)
    reason: v.string(), // User's explanation of no-show
    evidenceImages: v.array(v.string()), // Storage URLs of supporting images
    status: v.union(
      v.literal("pending"), // Awaiting admin review
      v.literal("approved"), // Refund approved, credits restored
      v.literal("rejected"), // Refund rejected
      v.literal("under_review"), // Being reviewed by admin
    ),
    adminNotes: v.optional(v.string()), // Admin's notes/decision reason
    reviewedBy: v.optional(v.id("users")), // Admin who reviewed
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    processedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_application", ["applicationId"])
    .index("by_status", ["status"])
    .index("by_user_status", ["userId", "status"])
    .index("by_participant", ["participantUserId"]),
};
