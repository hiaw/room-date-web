// Connection and Connection Notes domain types
import type { Doc, Id } from "../../../convex/_generated/dataModel";

// Base Connection Types
export type Connection = Doc<"connections">;
export type ConnectionId = Id<"connections">;

export type ConnectionNote = Doc<"connectionNotes">;
export type ConnectionNoteId = Id<"connectionNotes">;

// Extended Connection Interface (matches what's used in ConnectionsWithNotes)
export interface ConnectionWithDetails {
  _id: Id<"connections">;
  _creationTime: number;
  otherUser?: {
    profile?: {
      displayName?: string;
    } | null;
  };
  connectedViaEventId?: Id<"events">;
  lastMessage?: {
    content: string;
    _creationTime: number;
  };
}

// Enhanced Connection with Note Data
export interface ConnectionWithNote extends ConnectionWithDetails {
  displayName: string;
  note?: ConnectionNote;
  searchableText: string;
}

// Connection Note Editor Props
export interface ConnectionNoteEditorProps {
  connectionId: Id<"connections">;
  currentNickname?: string;
  currentNotes?: string;
  currentTags?: string[];
  otherUserName: string;
  isOpen: boolean;
  onSave: (data: ConnectionNoteData) => Promise<void>;
  onClose: () => void;
}

// Connection Note Save Data
export interface ConnectionNoteData {
  nickname?: string;
  notes?: string;
  tags?: string[];
}

// Component Props Interfaces
export interface ConnectionItemProps {
  connection: ConnectionWithNote;
  onEdit: (connectionId: Id<"connections">) => void;
  onMessage: (connectionId: Id<"connections">) => void;
}

export interface ConnectionsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  connectionCount: number;
}

export interface ConnectionActionsProps {
  connectionId: Id<"connections">;
  onEdit: (connectionId: Id<"connections">) => void;
  onMessage: (connectionId: Id<"connections">) => void;
  showEditButton?: boolean;
}

export interface ConnectionsListProps {
  connections: ConnectionWithNote[];
  loading: boolean;
  searchQuery: string;
  onEdit: (connectionId: Id<"connections">) => void;
  onMessage: (connectionId: Id<"connections">) => void;
  onDiscoverClick: () => void;
}

// Query Result Types
export interface ConnectionsQueryResult {
  data?: ConnectionWithDetails[];
  isLoading?: boolean;
}

export interface ConnectionNotesQueryResult {
  data?: ConnectionNote[];
  isLoading?: boolean;
}
