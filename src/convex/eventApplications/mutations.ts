import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  validateUserAge,
  validateEventCapacity,
  validateCanApply,
  validateCanRespond,
} from "./validation";
import { createConnection } from "./connections";
import { deductCreditLogic } from "../credits/index";

/**
 * Apply to join an event
 */
export const applyToEvent = mutation({
  args: {
    eventId: v.id("events"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to apply to events");
    }

    // Validate user can apply to this event
    const { event } = await validateCanApply(ctx, args.eventId, userId);

    // Check if user meets age restrictions
    await validateUserAge(ctx, userId, event.minAge, event.maxAge);

    // Check if event is full
    await validateEventCapacity(ctx, args.eventId, event.maxGuests);

    const applicationId = await ctx.db.insert("eventApplications", {
      eventId: args.eventId,
      applicantId: userId,
      status: "pending",
      message: args.message?.trim(),
      // Denormalized event info for better mobile UX
      eventTitle: event.title,
      eventStartTime: event.startTime,
      roomTitle: event.roomTitle,
    });

    // Log security event
    await ctx.db.insert("securityEvents", {
      eventType: "application_submitted",
      userId,
      metadata: {
        applicationId,
        eventId: args.eventId,
        eventOwnerId: event.ownerId,
        hasMessage: !!args.message,
      },
      timestamp: Date.now(),
      severity: "low",
    });

    return applicationId;
  },
});

/**
 * Respond to an application (approve/reject)
 */
export const respondToApplication = mutation({
  args: {
    applicationId: v.id("eventApplications"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    ownerResponse: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to respond to applications");
    }

    const { application, event } = await validateCanRespond(
      ctx,
      args.applicationId,
      userId,
    );

    // If approving, check if event would be over capacity
    if (args.status === "approved") {
      await validateEventCapacity(ctx, application.eventId, event.maxGuests);
    }

    // Update application
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      ownerResponse: args.ownerResponse?.trim(),
    });

    // If approved, create a connection between users and add to event chat
    if (args.status === "approved") {
      await createConnection(
        ctx,
        userId,
        application.applicantId,
        application.eventId,
      );

      // Deduct credit for approved participant
      await deductCreditLogic(
        ctx,
        userId,
        application.eventId,
        args.applicationId,
      );

      // Ensure owner is a participant (for old events)
      const ownerParticipant = await ctx.db
        .query("eventChatParticipants")
        .withIndex("by_event_user", (q) =>
          q.eq("eventId", application.eventId).eq("userId", event.ownerId),
        )
        .unique();

      let countIncrement = 0;
      if (!ownerParticipant) {
        await ctx.db.insert("eventChatParticipants", {
          eventId: application.eventId,
          userId: event.ownerId,
          role: "owner",
          joinedAt: event._creationTime,
        });
        countIncrement++;
      }

      // Add approved user to event chat participants
      const existingParticipant = await ctx.db
        .query("eventChatParticipants")
        .withIndex("by_event_user", (q) =>
          q
            .eq("eventId", application.eventId)
            .eq("userId", application.applicantId),
        )
        .unique();

      if (!existingParticipant) {
        await ctx.db.insert("eventChatParticipants", {
          eventId: application.eventId,
          userId: application.applicantId,
          role: "participant",
          joinedAt: Date.now(),
        });
        countIncrement++;
      }

      if (countIncrement > 0) {
        // Increment the denormalized participant count
        await ctx.db.patch(application.eventId, {
          chatParticipantCount:
            (event.chatParticipantCount ?? 0) + countIncrement,
        });
      }
    }

    return args.applicationId;
  },
});

/**
 * Cancel an application (applicant only)
 */
export const cancelApplication = mutation({
  args: {
    applicationId: v.id("eventApplications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to cancel application");
    }

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    if (application.applicantId !== userId) {
      throw new Error("Only applicant can cancel their application");
    }

    // Can only cancel pending applications
    if (application.status !== "pending") {
      throw new Error("Can only cancel pending applications");
    }

    await ctx.db.patch(args.applicationId, { status: "cancelled" });

    return args.applicationId;
  },
});
