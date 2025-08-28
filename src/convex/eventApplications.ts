// Re-export all event application functions for backward compatibility
export {
  getEventApplications,
  getMyApplications,
  applyToEvent,
  respondToApplication,
  cancelApplication,
} from "./eventApplications/index";

export type {
  ApplicationStatus,
  ApplicationWithDetails,
  ApplicationWithEvent,
} from "./eventApplications/types";
