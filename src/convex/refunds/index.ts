import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

// Submit refund request for no-show participant
export const submitRefundRequest = mutation({
  args: {
    eventId: v.id("events"),
    applicationId: v.id("eventApplications"),
    participantUserId: v.id("users"),
    reason: v.string(),
    evidenceImages: v.array(v.string()), // Storage URLs
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to submit refund request");
    }

    // Verify event exists and user owns it
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    if (event.ownerId !== userId) {
      throw new Error("Only event owner can request refunds");
    }

    // Verify application exists and was approved
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.status !== "approved") {
      throw new Error("Can only request refund for approved applications");
    }

    if (application.eventId !== args.eventId) {
      throw new Error("Application does not match event");
    }

    if (application.applicantId !== args.participantUserId) {
      throw new Error("Participant user ID does not match application");
    }

    // Check if refund request already exists for this application
    const existingRequest = await ctx.db
      .query("refundRequests")
      .withIndex("by_application", (q) =>
        q.eq("applicationId", args.applicationId),
      )
      .unique();

    if (existingRequest) {
      throw new Error("Refund request already exists for this application");
    }

    // Check if event has passed (can't request refund for future events)
    const now = Date.now();
    if (event.startTime && event.startTime > now) {
      throw new Error("Cannot request refund for future events");
    }

    // Create refund request
    const refundRequestId = await ctx.db.insert("refundRequests", {
      userId: userId as Id<"users">,
      eventId: args.eventId,
      applicationId: args.applicationId,
      participantUserId: args.participantUserId,
      creditsToRefund: 1, // Standard refund amount
      reason: args.reason.trim(),
      evidenceImages: args.evidenceImages,
      status: "pending",
      submittedAt: now,
    });

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "refund_request_submitted",
      userId: userId as Id<"users">,
      metadata: {
        refundRequestId,
        eventId: args.eventId,
        applicationId: args.applicationId,
        participantUserId: args.participantUserId,
        hasEvidence: args.evidenceImages.length > 0,
      },
      timestamp: now,
      severity: "medium",
    });

    return refundRequestId;
  },
});

// Get user's refund requests
export const getUserRefundRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to get refund requests");
    }

    const requests = await ctx.db
      .query("refundRequests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return requests;
  },
});

// Get pending refund requests (admin only)
export const getPendingRefundRequests = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to get pending refund requests");
    }

    // Note: In production, add proper admin role checking here

    const requests = await ctx.db
      .query("refundRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();

    return requests;
  },
});

// Review refund request (admin only)
export const reviewRefundRequest = mutation({
  args: {
    refundRequestId: v.id("refundRequests"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to review refund requests");
    }

    // Note: In production, add proper admin role checking here

    const request = await ctx.db.get(args.refundRequestId);
    if (!request) {
      throw new Error("Refund request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Refund request is not in pending status");
    }

    const now = Date.now();

    // Update refund request
    await ctx.db.patch(args.refundRequestId, {
      status: args.decision,
      adminNotes: args.adminNotes?.trim(),
      reviewedBy: userId as Id<"users">,
      reviewedAt: now,
      processedAt: args.decision === "approved" ? now : undefined,
    });

    // If approved, restore the credit
    if (args.decision === "approved") {
      // Get user's credit record
      let creditRecord = await ctx.db
        .query("connectionCredits")
        .withIndex("by_user", (q) => q.eq("userId", request.userId))
        .unique();

      if (!creditRecord) {
        // Create credit record if it doesn't exist
        await ctx.db.insert("connectionCredits", {
          userId: request.userId,
          availableCredits: request.creditsToRefund,
          heldCredits: 0,
          totalPurchased: 0,
          totalUsed: 0,
          lastUpdated: now,
        });
      } else {
        // Update existing record
        await ctx.db.patch(creditRecord._id, {
          availableCredits:
            creditRecord.availableCredits + request.creditsToRefund,
          totalUsed: Math.max(
            0,
            creditRecord.totalUsed - request.creditsToRefund,
          ),
          lastUpdated: now,
        });
      }

      // Record refund transaction
      await ctx.db.insert("creditTransactions", {
        userId: request.userId,
        type: "refund",
        amount: request.creditsToRefund,
        relatedEventId: request.eventId,
        relatedApplicationId: request.applicationId,
        description: `Refund for no-show participant (${request.creditsToRefund} credits)`,
        timestamp: now,
      });
    }

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "refund_request_reviewed",
      userId: userId as Id<"users">,
      metadata: {
        refundRequestId: args.refundRequestId,
        decision: args.decision,
        originalRequesterUserId: request.userId,
        creditsRefunded:
          args.decision === "approved" ? request.creditsToRefund : 0,
      },
      timestamp: now,
      severity: "medium",
    });

    return { success: true, decision: args.decision };
  },
});

// Get refund request details by ID
export const getRefundRequestById = query({
  args: {
    refundRequestId: v.id("refundRequests"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to get refund request details");
    }

    const request = await ctx.db.get(args.refundRequestId);
    if (!request) {
      throw new Error("Refund request not found");
    }

    // Users can only view their own requests (or admins can view all)
    if (request.userId !== userId) {
      // Note: In production, add proper admin role checking here
      throw new Error("Access denied");
    }

    return request;
  },
});
