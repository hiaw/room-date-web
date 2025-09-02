import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, optionalAuth } from "./lib/authHelpers";
import type { Id } from "./_generated/dataModel";

/**
 * Send a message to an event chat
 */
export const sendEventMessage = mutation({
  args: {
    eventId: v.id("events"),
    content: v.string(),
    messageType: v.optional(v.union(v.literal("text"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const userId = await requireAuth(ctx);

    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .first();

    // Validate message content for non-system messages
    if (!args.content.trim() && args.messageType !== "system") {
      throw new Error("Message content cannot be empty");
    }

    // Check if user is a participant in the event chat
    const participant = await ctx.db
      .query("eventChatParticipants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId as Id<"users">),
      )
      .unique();

    if (!participant) {
      throw new Error("You must be an approved participant to send messages");
    }

    // Create the message
    const messageId = await ctx.db.insert("eventMessages", {
      eventId: args.eventId,
      senderId: userId as Id<"users">,
      content: args.content.trim(),
      messageType: args.messageType || "text",
      senderDisplayName: profile?.displayName || "Unknown User",
      senderProfileImageUrl: profile?.profileImageUrl,
    });

    // Update participant's last activity
    await ctx.db.patch(participant._id, {
      lastSeenAt: Date.now(),
    });

    return messageId;
  },
});

/**
 * Get messages for an event chat with pagination
 */
export const getEventMessages = query({
  args: {
    eventId: v.id("events"),
    paginationOpts: v.optional(
      v.object({
        numItems: v.number(),
        cursor: v.union(v.string(), v.null()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const userId = await optionalAuth(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to view messages");
    }

    // Check if user is a participant in the event chat
    const participant = await ctx.db
      .query("eventChatParticipants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId as Id<"users">),
      )
      .unique();

    if (!participant) {
      throw new Error("You must be an approved participant to view messages");
    }

    // Get messages with pagination
    const result = await ctx.db
      .query("eventMessages")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .paginate(args.paginationOpts || { numItems: 50, cursor: null });

    return {
      ...result,
      page: result.page.reverse(), // Return in chronological order
    };
  },
});

/**
 * Get participants for an event chat
 */
export const getEventChatParticipants = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const userId = await optionalAuth(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to view participants");
    }

    // Check if user is a participant in the event chat
    const participant = await ctx.db
      .query("eventChatParticipants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId as Id<"users">),
      )
      .unique();

    if (!participant) {
      throw new Error(
        "You must be an approved participant to view participants",
      );
    }

    // Get all participants
    const participants = await ctx.db
      .query("eventChatParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Extract user IDs for batch fetching
    const userIds = participants.map((p) => p.userId);

    // Batch fetch users and profiles to avoid N+1 queries
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

    // Batch fetch user profiles using filter with or condition
    const userProfiles = await ctx.db
      .query("userProfiles")
      .filter((q) =>
        q.or(...userIds.map((userId) => q.eq(q.field("userId"), userId))),
      )
      .collect();

    // Create maps for efficient O(1) lookup
    const usersById = new Map(
      users
        .filter((u): u is NonNullable<typeof u> => u !== null)
        .map((u) => [u._id, u]),
    );
    const profilesByUserId = new Map(userProfiles.map((p) => [p.userId, p]));

    // Enrich participants using the maps
    const enrichedParticipants = participants.map((p) => {
      const user = usersById.get(p.userId);
      const userProfile = profilesByUserId.get(p.userId);
      if (!user) {
        return null;
      }
      return {
        ...p,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        profile: userProfile ?? null,
      };
    });

    return enrichedParticipants.filter(
      (p): p is NonNullable<typeof p> => p !== null,
    );
  },
});

/**
 * Mark messages as seen for the current user
 */
export const markEventMessagesSeen = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const userId = await requireAuth(ctx);

    // Check if user is a participant in the event chat
    const participant = await ctx.db
      .query("eventChatParticipants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId as Id<"users">),
      )
      .unique();

    if (!participant) {
      throw new Error(
        "You must be an approved participant to mark messages as seen",
      );
    }

    // Update participant's last seen timestamp
    await ctx.db.patch(participant._id, {
      lastSeenAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Check if current user can access event chat
 */
export const canAccessEventChat = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const userId = await optionalAuth(ctx);
    if (!userId) {
      return { canAccess: false, reason: "Not authenticated" };
    }

    // Check if user is a participant in the event chat
    const participant = await ctx.db
      .query("eventChatParticipants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId as Id<"users">),
      )
      .unique();

    if (!participant) {
      return { canAccess: false, reason: "Not a participant" };
    }

    return { canAccess: true, role: participant.role };
  },
});

/**
 * Get event basic info for chat header
 */
export const getEventChatInfo = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Check if user is authenticated
    const userId = await optionalAuth(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to view event chat info");
    }

    // Check if user is a participant in the event chat
    const participant = await ctx.db
      .query("eventChatParticipants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", userId as Id<"users">),
      )
      .unique();

    if (!participant) {
      throw new Error("You must be an approved participant to view event info");
    }

    // Get event details
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Get participant count
    const participantCount = await ctx.db
      .query("eventChatParticipants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect()
      .then((participants) => participants.length);

    // Get room info
    const room = event.roomId ? await ctx.db.get(event.roomId) : null;

    return {
      event: {
        _id: event._id,
        title: event.title,
        roomTitle: room?.title || "Unknown Room",
      },
      participantCount,
      currentUserRole: participant.role,
    };
  },
});
