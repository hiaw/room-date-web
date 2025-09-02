/**
 * Shared security configuration constants
 * Centralized place to manage security thresholds, timeouts, and rules
 */

export const SECURITY_THRESHOLDS = {
  // Failed login attempt limits
  MAX_FAILED_LOGINS: 5,
  MIN_FAILED_LOGINS_FOR_MONITORING: 3,

  // Session creation limits
  MAX_RAPID_SESSIONS: 3,
  MAX_SESSIONS_IN_WINDOW: 3,

  // Time windows (in minutes)
  RAPID_SESSION_WINDOW_MINUTES: 15,
  FAILED_LOGIN_WINDOW_MINUTES: 15,

  // Risk scoring
  RISK_SCORE_PER_ATTEMPT: 20,
  MAX_RISK_SCORE: 100,
} as const;

export const SECURITY_TIME_WINDOWS = {
  // Convert minutes to milliseconds for time calculations
  RAPID_SESSION_WINDOW:
    SECURITY_THRESHOLDS.RAPID_SESSION_WINDOW_MINUTES * 60 * 1000,
  FAILED_LOGIN_WINDOW:
    SECURITY_THRESHOLDS.FAILED_LOGIN_WINDOW_MINUTES * 60 * 1000,
} as const;

/**
 * Security action types that always trigger session revocation
 */
export const IMMEDIATE_REVOCATION_EVENTS = [
  "device_fingerprint_mismatch",
  "token_reuse_detected",
  "account_lockout",
  "password_breach_detected",
] as const;

/**
 * Security severity levels for different event types
 */
export const SECURITY_SEVERITY_LEVELS = {
  LOW: [
    "auth_success",
    "room_created",
    "event_created",
    "application_submitted",
    "connection_created",
    "message_sent",
    "profile_updated",
    "image_uploaded",
  ],
  MEDIUM: ["auth_failure", "rate_limit_hit", "location_accessed"],
  HIGH: ["suspicious_activity", "unauthorized_access", "spam_detected"],
  CRITICAL: [
    "device_fingerprint_mismatch",
    "token_reuse_detected",
    "password_breach_detected",
    "account_lockout",
  ],
} as const;

/**
 * Utility functions for security calculations
 */
export const SecurityUtils = {
  /**
   * Calculate risk score based on attempt count
   */
  calculateRiskScore: (attemptCount: number): number => {
    return Math.min(
      attemptCount * SECURITY_THRESHOLDS.RISK_SCORE_PER_ATTEMPT,
      SECURITY_THRESHOLDS.MAX_RISK_SCORE,
    );
  },

  /**
   * Check if an event type requires immediate session revocation
   */
  requiresImmediateRevocation: (eventType: string): boolean => {
    return IMMEDIATE_REVOCATION_EVENTS.includes(
      eventType as (typeof IMMEDIATE_REVOCATION_EVENTS)[number],
    );
  },

  /**
   * Get timestamp for security time window
   */
  getTimeWindowStart: (
    windowType: "rapid_session" | "failed_login",
  ): number => {
    const now = Date.now();
    switch (windowType) {
      case "rapid_session":
        return now - SECURITY_TIME_WINDOWS.RAPID_SESSION_WINDOW;
      case "failed_login":
        return now - SECURITY_TIME_WINDOWS.FAILED_LOGIN_WINDOW;
      default:
        return now;
    }
  },
} as const;
