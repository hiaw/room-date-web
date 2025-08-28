// Connection utilities
import type { Connection } from "../types";

export function getOtherUserId(
  connection: Connection,
  currentUserId: string,
): string {
  return connection.user1Id === currentUserId
    ? connection.user2Id
    : connection.user1Id;
}

export function isConnectionActive(connection: Connection): boolean {
  return connection.status === "active";
}

export function isConnectionBlocked(
  connection: Connection,
  currentUserId: string,
): boolean {
  return (
    (connection.status === "blocked_by_user1" &&
      connection.user1Id === currentUserId) ||
    (connection.status === "blocked_by_user2" &&
      connection.user2Id === currentUserId)
  );
}
