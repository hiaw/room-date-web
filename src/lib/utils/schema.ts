import type {
  UserProfile,
  Room,
  Event,
  EventApplication,
  Connection,
  SearchFilters,
  UserWithProfile,
} from "../types/schema";

// Date and time utilities
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isToday(timestamp: number): boolean {
  const today = new Date();
  const date = new Date(timestamp);
  return today.toDateString() === date.toDateString();
}

export function getTimeUntilEvent(startTime: number): string {
  const now = Date.now();
  const diff = startTime - now;

  if (diff < 0) return "Started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// User profile utilities
export function calculateAge(dateOfBirth: number): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getDisplayName(user: UserWithProfile): string {
  return user.profile?.displayName || user.name || user.email || "Anonymous";
}

export function isProfileComplete(profile: UserProfile): boolean {
  return !!(profile.displayName && profile.dateOfBirth && profile.bio);
}

// Address utilities
export function formatAddress(room: Room): string {
  if (room.address) return room.address;

  const addressParts = [
    room.streetAddress,
    room.city,
    room.state,
    room.zipCode,
    room.country,
  ].filter(Boolean);

  return addressParts.length > 0
    ? addressParts.join(", ")
    : "No address specified";
}

// Event utilities
export function formatEventTiming(event: Event): string {
  if (event.isFlexibleTiming) return "Flexible timing";

  if (event.startTime && event.endTime) {
    const start = formatDateTime(event.startTime);
    const end = formatTime(event.endTime);
    return `${start} - ${end}`;
  }

  if (event.startTime) {
    return `Starts ${formatDateTime(event.startTime)}`;
  }

  return "No time specified";
}

export function formatAgeRange(minAge?: number, maxAge?: number): string {
  if (minAge && maxAge) return `${minAge}-${maxAge}`;
  if (minAge) return `${minAge}+`;
  if (maxAge) return `Up to ${maxAge}`;
  return "Any age";
}

export function formatGenderPreference(preferredGender?: string[]): string {
  if (!preferredGender || preferredGender.length === 0) return "Any";

  const formatted = preferredGender.map((gender) =>
    gender.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  );

  return formatted.join(", ");
}

export function isEventUpcoming(event: Event): boolean {
  if (!event.startTime) return true; // Flexible timing events are always "upcoming"
  return event.startTime > Date.now();
}

export function canApplyToEvent(
  event: Event,
  userProfile?: UserProfile,
  existingApplication?: EventApplication,
): boolean {
  if (!event.isActive) return false;
  if (existingApplication) return false;
  if (!isEventUpcoming(event)) return false;

  // Check age restrictions
  if (userProfile?.dateOfBirth) {
    const age = calculateAge(userProfile.dateOfBirth);
    if (event.minAge && age < event.minAge) return false;
    if (event.maxAge && age > event.maxAge) return false;
  }

  return true;
}

// Connection utilities
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

// Message utilities
export function formatMessageTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(timestamp);
}

export function truncateMessage(
  content: string,
  maxLength: number = 50,
): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}

// Search and filter utilities
export function matchesSearchFilters(
  event: Event,
  filters: SearchFilters,
): boolean {
  if (filters.city && event.roomId) {
    // Note: This would need to be checked against the room's city in the actual query
    // This is just a placeholder for client-side filtering
  }

  if (filters.minAge && event.maxAge && event.maxAge < filters.minAge)
    return false;
  if (filters.maxAge && event.minAge && event.minAge > filters.maxAge)
    return false;

  if (filters.preferredGender && event.preferredGender) {
    const hasMatch = filters.preferredGender.some((gender) =>
      event.preferredGender!.includes(gender),
    );
    if (!hasMatch) return false;
  }

  if (
    filters.hasFlexibleTiming !== undefined &&
    event.isFlexibleTiming !== filters.hasFlexibleTiming
  ) {
    return false;
  }

  if (
    filters.startDateAfter &&
    event.startTime &&
    event.startTime < filters.startDateAfter
  ) {
    return false;
  }

  if (
    filters.startDateBefore &&
    event.startTime &&
    event.startTime > filters.startDateBefore
  ) {
    return false;
  }

  return true;
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function validateAge(dateOfBirth: number): boolean {
  const age = calculateAge(dateOfBirth);
  return age >= 18 && age <= 100;
}

// Mobile-specific utilities
export function isMobileViewport(width: number): boolean {
  return width < 768;
}

export function isTabletViewport(width: number): boolean {
  return width >= 768 && width < 1024;
}

export function getOptimalImageSize(
  width: number,
): "small" | "medium" | "large" {
  if (width < 400) return "small";
  if (width < 800) return "medium";
  return "large";
}
