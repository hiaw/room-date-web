// Re-exports for backward compatibility
// Import from the organized modules
export { bookmarkEvent, unbookmarkEvent } from "./bookmarks/mutations";
export { getBookmarkedEvents } from "./bookmarks/queries";
export { recordEventView } from "./analytics/mutations";
export { getUserInsights } from "./analytics/queries";
export {
  registerPushToken,
  deactivatePushToken,
} from "./notifications/mutations";
export { getPushTokens } from "./notifications/queries";
