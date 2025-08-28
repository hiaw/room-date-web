import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { ApplicationWithDetails, ApplicationWithEvent } from "./types";

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
  handler: async (ctx, args): Promise<ApplicationWithDetails[]> => {
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
    const applicationsWithDetails: ApplicationWithDetails[] = [];
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
  handler: async (ctx, args): Promise<ApplicationWithEvent[]> => {
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
    const applicationsWithDetails: ApplicationWithEvent[] = [];
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
