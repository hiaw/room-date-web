// Re-exports for backward compatibility
// Import from organized utility modules

// Date and time utilities
export {
  formatDate,
  formatDateTime,
  formatTime,
  isToday,
  getTimeUntilEvent,
  formatMessageTime,
} from "./date";

// User profile utilities
export {
  calculateAge,
  getDisplayName,
  isProfileComplete,
  getUserInitials,
  formatUserName,
  getUserDisplayName,
} from "./user";

// Location and address utilities
export {
  formatAddress,
  isMobileViewport,
  isTabletViewport,
  getOptimalImageSize,
} from "./location";

// Event-specific utilities
export {
  formatEventTiming,
  formatAgeRange,
  formatGenderPreference,
  isEventUpcoming,
  canApplyToEvent,
  matchesSearchFilters,
  truncateMessage,
} from "./event";

// Connection utilities
export {
  getOtherUserId,
  isConnectionActive,
  isConnectionBlocked,
} from "./connection";
