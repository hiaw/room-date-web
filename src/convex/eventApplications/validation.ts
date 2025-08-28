import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

/**
 * Validates if a user meets the age requirements for an event
 */
export async function validateUserAge(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  minAge?: number,
  maxAge?: number,
): Promise<void> {
  if (!minAge && !maxAge) return;

  const userProfile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (!userProfile?.dateOfBirth) {
    throw new Error("Date of birth required for age-restricted events");
  }

  const userAge = Math.floor(
    (Date.now() - userProfile.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000),
  );

  if (minAge && userAge < minAge) {
    throw new Error(`Must be at least ${minAge} years old to apply`);
  }

  if (maxAge && userAge > maxAge) {
    throw new Error(`Must be ${maxAge} years old or younger to apply`);
  }
}

/**
 * Validates if an event can accept more guests
 */
export async function validateEventCapacity(
  ctx: QueryCtx | MutationCtx,
  eventId: Id<"events">,
  maxGuests?: number,
): Promise<void> {
  if (!maxGuests) return;

  const approvedApplications = await ctx.db
    .query("eventApplications")
    .withIndex("by_event_status", (q) =>
      q.eq("eventId", eventId).eq("status", "approved"),
    )
    .collect();

  if (approvedApplications.length >= maxGuests) {
    throw new Error("Event is at full capacity");
  }
}

/**
 * Validates if a user can apply to an event
 */
export async function validateCanApply(
  ctx: QueryCtx | MutationCtx,
  eventId: Id<"events">,
  userId: Id<"users">,
): Promise<{ event: Doc<"events"> }> {
  // Check if event exists and is active
  const event = await ctx.db.get(eventId);
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
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .filter((q) => q.eq(q.field("applicantId"), userId))
    .first();

  if (existingApplication) {
    throw new Error("Already applied to this event");
  }

  return { event };
}

/**
 * Validates if a user can respond to an application
 */
export async function validateCanRespond(
  ctx: QueryCtx | MutationCtx,
  applicationId: Id<"eventApplications">,
  userId: Id<"users">,
): Promise<{ application: Doc<"eventApplications">; event: Doc<"events"> }> {
  const application = await ctx.db.get(applicationId);
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

  return { application, event };
}
