// Page Types
// Types for page-specific state, filters, and data structures

// Discover Page Types
export interface LocationState {
  latitude: number;
  longitude: number;
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface GuestCountRange {
  min: number;
  max: number;
}

export type DateRange = "today" | "this_week" | "this_month" | "any";
export type SortBy = "distance" | "date" | "popularity" | "newest";
export type SortOrder = "asc" | "desc";
export type ActivityLevel = "low" | "medium" | "high" | null;
export type PriceType = "any" | "free" | "paid";

export interface DiscoverFilters {
  searchQuery: string;
  selectedGenders: string[];
  ageRange: AgeRange;
  maxDistance: number;
  selectedCategories: string[];
  selectedActivityLevel: ActivityLevel;
  selectedDateRange: DateRange;
  showPastEvents: boolean;
  guestCountRange: GuestCountRange;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

export interface EventCategory {
  value: string;
  label: string;
  emoji: string;
}

export interface ActivityLevelOption {
  value: "low" | "medium" | "high";
  label: string;
  description: string;
}

export interface DiscoverPageState {
  userLocation: LocationState | null;
  locationError: string | null;
  showFilters: boolean;
  filters: DiscoverFilters;
  loading: boolean;
  error: Error | null;
}

// Profile Page Types
export interface ProfilePageFormData {
  displayName: string;
  bio: string;
  dateOfBirth: string;
  location: string;
  profileImages: string[];
}

// Room Creation Page Types
export interface RoomPageFormData {
  title: string;
  description: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  images: string[];
}

// Event Creation Page Types
export interface EventPageFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isFlexibleTiming: boolean;
  maxGuests: number | undefined;
  minAge: number | undefined;
  maxAge: number | undefined;
  preferredGender: string[];
  eventImages: string[];
}

export interface ProfilePageState {
  profile: unknown; // Use proper type from schema
  loading: boolean;
  saving: boolean;
  formData: ProfilePageFormData;
}

// Room Creation Page Types
export interface RoomCreationState {
  formData: RoomPageFormData;
  saving: boolean;
  locationLoading: boolean;
}

export interface EventCreationState {
  room: unknown; // Use proper type from schema
  roomLoading: boolean;
  formData: EventPageFormData;
  saving: boolean;
}

// Connections Page Types
export interface ConnectionWithDetails {
  _id: string;
  user1Id: string;
  user2Id: string;
  status: "pending" | "accepted" | "declined";
  _creationTime: number;
  user1DisplayName?: string;
  user2DisplayName?: string;
  user1ProfileImageUrl?: string;
  user2ProfileImageUrl?: string;
  otherUser?: unknown; // Use proper user type
  unreadCount?: number;
  lastMessage?: unknown; // Use proper message type
}

export interface ConnectionsPageState {
  connections: ConnectionWithDetails[];
  loading: boolean;
  activeTab: "connections" | "messages";
}

// Messages Page Types
export interface MessageWithDetails {
  _id: string;
  connectionId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: "text" | "image" | "system";
  isRead: boolean;
  imageUrl?: string;
  _creationTime: number;
  sender?: unknown; // Use proper user type
  senderDisplayName?: string;
  senderProfileImageUrl?: string;
}

export interface Conversation {
  connectionId: string;
  otherUser: unknown; // Use proper user type
  messages: MessageWithDetails[];
  unreadCount: number;
  lastMessage?: MessageWithDetails;
}

export interface MessagesPageState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  loading: boolean;
  sending: boolean;
  newMessage: string;
}

// Generic Page State Types
export interface PageState<T = unknown> {
  data: T;
  loading: boolean;
  error: string | null;
}

export interface PaginatedPageState<T = unknown> extends PageState<T[]> {
  hasMore: boolean;
  nextCursor?: string;
}

// Page-specific Form State Types
export interface PageFormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface PageFormFieldState {
  value: unknown;
  error: string | null;
  touched: boolean;
  valid: boolean;
}

// Route Parameters Types
export interface RoomPageParams {
  roomId: string;
}

export interface EventPageParams {
  eventId: string;
}

export interface ProfilePageParams {
  edit?: string; // For profile/edit route
}

// Loading and Error States
export interface PageAsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PageInfiniteScrollState<T = unknown> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
}

// Search and Filter Types
export interface PageSearchState {
  query: string;
  isSearching: boolean;
  results: unknown[];
  filters: Record<string, unknown>;
}

export interface PageFilterState {
  isOpen: boolean;
  activeFilters: Record<string, unknown>;
  availableFilters: Record<string, unknown>;
}
