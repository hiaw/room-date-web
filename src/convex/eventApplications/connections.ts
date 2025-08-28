import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

/**
 * Helper function to create a connection between two users
 */
export async function createConnection(
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
