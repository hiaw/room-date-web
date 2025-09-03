// Connections data processing utilities and logic
import type {
  ConnectionWithDetails,
  ConnectionWithNote,
  ConnectionNote,
} from "$lib/types/domains/connections.js";
import { getConnectionDisplayName } from "$lib/utils/userDisplay.js";

/**
 * Create a map of connection notes for quick lookup by connection ID
 */
export function createNotesMap(
  notes: ConnectionNote[],
): Map<string, ConnectionNote> {
  return new Map(notes.map((note) => [note.connectionId, note]));
}

/**
 * Process raw connections with their notes to create enhanced connection objects
 */
export function processConnections(
  connections: ConnectionWithDetails[],
  notesMap: Map<string, ConnectionNote>,
): ConnectionWithNote[] {
  return connections.map((connection) => {
    const note = notesMap.get(connection._id);
    const displayName = getConnectionDisplayName(
      note?.nickname,
      connection.otherUser?.profile?.displayName,
      "Unknown User",
    );

    // Create searchable text for filtering
    const searchableText = [
      displayName,
      note?.notes || "",
      note?.tags?.join(" ") || "",
    ]
      .join(" ")
      .toLowerCase();

    return {
      ...connection,
      displayName,
      note,
      searchableText,
    };
  });
}

/**
 * Filter connections based on search query
 * Searches across display name, notes, and tags
 */
export function filterConnections(
  connections: ConnectionWithNote[],
  searchQuery: string,
): ConnectionWithNote[] {
  if (!searchQuery.trim()) {
    return connections;
  }

  const searchLower = searchQuery.toLowerCase();
  return connections.filter((connection) =>
    connection.searchableText.includes(searchLower),
  );
}

/**
 * Create enhanced connections from raw data (combines processing and notes mapping)
 */
export function createEnhancedConnections(
  connections: ConnectionWithDetails[],
  notes: ConnectionNote[],
): ConnectionWithNote[] {
  const notesMap = createNotesMap(notes);
  return processConnections(connections, notesMap);
}
