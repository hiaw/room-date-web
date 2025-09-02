/**
 * Event management related types
 */

export interface EventDetails {
  _id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  maxGuests: number;
  isActive: boolean;
  ownerId: string;
  roomId: string;
  applicationCount?: number;
  pendingApplicationCount?: number;
  room?: {
    _id: string;
    title: string;
    location?: string;
    city?: string;
  };
  owner?: {
    _id: string;
    name?: string;
    email?: string;
    profile?: {
      displayName?: string;
      profileImageUrl?: string;
    };
  };
}

export interface EventManagementActions {
  onViewEvent: () => void;
  onEditEvent: () => void;
  onDeleteEvent: () => void;
}

export interface EventStats {
  applicationCount: number;
  pendingApplicationCount: number;
}
