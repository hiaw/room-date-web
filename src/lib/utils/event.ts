// Event-specific utilities
import type {
  Event,
  EventApplication,
  UserProfile,
  SearchFilters,
} from "../types";
import { formatDateTime, formatTime } from "./date";
import { calculateAge } from "./user";

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

// Message utilities
export function truncateMessage(
  content: string,
  maxLength: number = 50,
): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}
