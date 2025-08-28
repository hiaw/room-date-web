import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id, Doc } from "../_generated/dataModel";

/**
 * Validates if a user can modify a room (must be owner)
 */
export async function validateRoomOwnership(
  ctx: QueryCtx | MutationCtx,
  roomId: Id<"rooms">,
  userId: Id<"users">,
): Promise<{ room: Doc<"rooms"> }> {
  const room = await ctx.db.get(roomId);
  if (!room) {
    throw new Error("Room not found");
  }

  if (room.ownerId !== userId) {
    throw new Error("Only room owner can modify this room");
  }

  return { room };
}

/**
 * Validates room title is provided and not empty
 */
export function validateRoomTitle(title?: string): void {
  if (!title?.trim()) {
    throw new Error("Room title is required");
  }
}

/**
 * Calculate distance between two points in miles
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Radius of Earth in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filters rooms by location
 */
export function filterRoomsByLocation(
  rooms: Doc<"rooms">[],
  userLat?: number,
  userLon?: number,
  radiusInMiles?: number,
): Doc<"rooms">[] {
  if (!userLat || !userLon || !radiusInMiles) {
    return rooms;
  }

  return rooms.filter((room) => {
    if (!room.latitude || !room.longitude) return false;
    const distance = calculateDistance(
      userLat,
      userLon,
      room.latitude,
      room.longitude,
    );
    return distance <= radiusInMiles;
  });
}
