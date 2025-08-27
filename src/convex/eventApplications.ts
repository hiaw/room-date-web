import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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

    // Check if event exists and is active
    const event = await ctx.db.get(args.eventId);
    if (!event || !event.isActive) {
      throw new Error("Event not found or inactive");
    }

    // Can't apply to your own event
    if (event.ownerId === userId) {
      throw new Error("Cannot apply to your own event");
    }

    // Check if user already applied
    const existingApplication = await ctx.db
      .query("eventApplications")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.eq(q.field("applicantId"), userId))
      .first();

    if (existingApplication) {
      throw new Error("Already applied to this event");
    }

    // Check if event has age restrictions and user meets them
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (userProfile?.dateOfBirth && (event.minAge || event.maxAge)) {
      const userAge = Math.floor(
        (Date.now() - userProfile.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000),
      );

      if (event.minAge && userAge < event.minAge) {
        throw new Error(`Must be at least ${event.minAge} years old to apply`);
      }

      if (event.maxAge && userAge > event.maxAge) {
        throw new Error(
          `Must be ${event.maxAge} years old or younger to apply`,
        );
      }
    }

    // Check if event is full (has max guests and is already at capacity)
    if (event.maxGuests) {
      const approvedApplications = await ctx.db
        .query("eventApplications")
        .withIndex("by_event_status", (q) =>
          q.eq("eventId", args.eventId).eq("status", "approved"),
        )
        .collect();

      if (approvedApplications.length >= event.maxGuests) {
        throw new Error("Event is at full capacity");
      }
    }

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
 * Get applications for an event (event owner only)
 */
export const getEventApplications = query({
  args: {
    eventId: v.id("events"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to view applications");
    }

    // Verify user owns the event
    const event = await ctx.db.get(args.eventId);
    if (!event || event.ownerId !== userId) {
      throw new Error("Only event owner can view applications");
    }

    let query = ctx.db
      .query("eventApplications")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const applications = await query.collect();

    // Get applicant details for each application
    const applicationsWithDetails = [];
    for (const app of applications) {
      const applicant = await ctx.db.get(app.applicantId);
      const applicantProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_user", (q) => q.eq("userId", app.applicantId))
        .first();

      applicationsWithDetails.push({
        ...app,
        applicant: applicant
          ? {
              ...applicant,
              profile: applicantProfile,
            }
          : undefined,
      });
    }

    return applicationsWithDetails;
  },
});

/**
 * Get current user's applications
 */
export const getMyApplications = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("eventApplications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const applications = await query.order("desc").collect();

    // Get event details for each application
    const applicationsWithDetails = [];
    for (const app of applications) {
      const event = await ctx.db.get(app.eventId);
      if (event) {
        applicationsWithDetails.push({
          ...app,
          event,
        });
      }
    }

    return applicationsWithDetails;
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

    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    // Verify user owns the event
    const event = await ctx.db.get(application.eventId);
    if (!event || event.ownerId !== userId) {
      throw new Error("Only event owner can respond to applications");
    }

    // Can only respond to pending applications
    if (application.status !== "pending") {
      throw new Error("Can only respond to pending applications");
    }

    // If approving, check if event would be over capacity
    if (args.status === "approved" && event.maxGuests) {
      const approvedApplications = await ctx.db
        .query("eventApplications")
        .withIndex("by_event_status", (q) =>
          q.eq("eventId", application.eventId).eq("status", "approved"),
        )
        .collect();

      if (approvedApplications.length >= event.maxGuests) {
        throw new Error("Event is at full capacity");
      }
    }

    // Update application
    await ctx.db.patch(args.applicationId, {
      status: args.status,
      ownerResponse: args.ownerResponse?.trim(),
    });

    // If approved, create a connection between users
    if (args.status === "approved") {
      await createConnection(
        ctx,
        userId,
        application.applicantId,
        application.eventId,
      );
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

/**
 * Helper function to create a connection between two users
 */
async function createConnection(
  ctx: MutationCtx,
  user1Id: Id<"users">,
  user2Id: Id<"users">,
  eventId: Id<"events">,
): Promise<string> {
  // Check if connection already exists
  const existingConnection = await ctx.db
    .query("connections")
    .withIndex("by_users", (q) =>
      q.eq("user1Id", user1Id).eq("user2Id", user2Id),
    )
    .first();

  if (existingConnection) {
    return existingConnection._id;
  }

  // Also check the reverse direction
  const reverseConnection = await ctx.db
    .query("connections")
    .withIndex("by_users", (q) =>
      q.eq("user1Id", user2Id).eq("user2Id", user1Id),
    )
    .first();

  if (reverseConnection) {
    return reverseConnection._id;
  }

  // Get user profiles for denormalized data
  const user1Profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", user1Id))
    .first();

  const user2Profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", user2Id))
    .first();

  // Create new connection
  const connectionId = await ctx.db.insert("connections", {
    user1Id,
    user2Id,
    status: "active",
    connectedViaEventId: eventId,
    lastMessageAt: undefined,
    // Denormalized user info for performance
    user1DisplayName: user1Profile?.displayName,
    user2DisplayName: user2Profile?.displayName,
    user1ProfileImageUrl: user1Profile?.profileImageUrl,
    user2ProfileImageUrl: user2Profile?.profileImageUrl,
  });

  // Log security event
  await ctx.db.insert("securityEvents", {
    eventType: "connection_created",
    userId: user1Id,
    metadata: {
      connectionId,
      connectedUserId: user2Id,
      eventId,
      connectionType: "event_approval",
    },
    timestamp: Date.now(),
    severity: "low",
  });

  return connectionId;
}
