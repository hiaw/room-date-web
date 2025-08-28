import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get user analytics/insights
 */
export const getUserInsights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Count rooms created
    const rooms = await ctx.db
      .query("rooms")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const activeRooms = rooms.filter((room) => room.isActive);

    // Count events hosted
    const events = await ctx.db
      .query("events")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const activeEvents = events.filter((event) => event.isActive);

    // Count applications sent
    const applicationsSent = await ctx.db
      .query("eventApplications")
      .withIndex("by_applicant", (q) => q.eq("applicantId", userId))
      .collect();

    // Count applications received
    const applicationsReceived = [];
    for (const event of events) {
      const eventApplications = await ctx.db
        .query("eventApplications")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .collect();
      applicationsReceived.push(...eventApplications);
    }

    // Count connections
    const connections1 = await ctx.db
      .query("connections")
      .withIndex("by_user1", (q) => q.eq("user1Id", userId))
      .collect();

    const connections2 = await ctx.db
      .query("connections")
      .withIndex("by_user2", (q) => q.eq("user2Id", userId))
      .collect();

    const activeConnections = [...connections1, ...connections2].filter(
      (conn) => conn.status === "active",
    );

    return {
      totalRoomsCreated: rooms.length,
      totalActiveRooms: activeRooms.length,
      totalEventsHosted: events.length,
      totalActiveEvents: activeEvents.length,
      totalApplicationsSent: applicationsSent.length,
      totalApplicationsReceived: applicationsReceived.length,
      totalConnections: activeConnections.length,
      memberSince: new Date(Math.min(...rooms.map((r) => r._creationTime))),
    };
  },
});
