// Security Types for Client-side Security Utils

// Device Fingerprinting
export interface DeviceFingerprint {
  userAgent: string;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
  };
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  hash: string;
}

// Security Event Types
export type SecurityEvent =
  | "device_mismatch"
  | "suspicious_location"
  | "multiple_sessions"
  | "token_reuse"
  | "failed_auth"
  | "secure_logout"
  | "fingerprint_mismatch"
  | "session_expired"
  | "unauthorized_access"
  | "suspicious_activity";

// Security Event Details
export interface SecurityEventDetails {
  userId?: string;
  sessionId?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  location?: string;
  timestamp: number;
  severity: "low" | "medium" | "high" | "critical";
  metadata?: Record<string, string | number | boolean>;
}

// Security Thresholds Configuration
export interface SecurityThresholds {
  readonly CHANGE_PASSWORD: number;
  readonly DELETE_ACCOUNT: number;
  readonly CHANGE_EMAIL: number;
  readonly CREATE_EVENT: number;
  readonly JOIN_EVENT: number;
  readonly SEND_MESSAGE: number;
}

// Security Check Function Signatures
export interface SecurityCheckFunctions {
  profileChange: (sessionCreationTime: number) => boolean;
  accountDeletion: (sessionCreationTime: number) => boolean;
  eventCreation: (sessionCreationTime: number) => boolean;
  eventJoining: (sessionCreationTime: number) => boolean;
  messaging: (sessionCreationTime: number) => boolean;
}

// Session Security Information
export interface SessionSecurityInfo {
  creationTime: number;
  lastActivity: number;
  deviceFingerprint: string;
  isValid: boolean;
  expiresAt: number;
  ipAddress?: string;
  userAgent?: string;
}

// Security Validation Result
export interface SecurityValidationResult {
  isValid: boolean;
  requiresReauth: boolean;
  reason?: string;
  action?: "allow" | "deny" | "require_reauth" | "require_mfa";
  metadata?: Record<string, any>;
}

// Security Configuration
export interface SecurityConfig {
  deviceFingerprintEnabled: boolean;
  sessionTimeoutMinutes: number;
  requireReauthForSensitiveOps: boolean;
  maxConcurrentSessions: number;
  logSecurityEvents: boolean;
  autoLogoutOnSuspiciousActivity: boolean;
}

// Default Security Configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  deviceFingerprintEnabled: true,
  sessionTimeoutMinutes: 60 * 24, // 24 hours
  requireReauthForSensitiveOps: true,
  maxConcurrentSessions: 5,
  logSecurityEvents: true,
  autoLogoutOnSuspiciousActivity: true,
};

// Security Thresholds (in minutes)
export const SECURITY_THRESHOLDS: SecurityThresholds = {
  CHANGE_PASSWORD: 15, // 15 minutes
  DELETE_ACCOUNT: 30, // 30 minutes
  CHANGE_EMAIL: 15, // 15 minutes
  CREATE_EVENT: 60, // 1 hour
  JOIN_EVENT: 120, // 2 hours
  SEND_MESSAGE: 240, // 4 hours
} as const;

// Security Risk Levels
export type SecurityRiskLevel = "low" | "medium" | "high" | "critical";

// Security Action Types
export type SecurityActionType =
  | "block_access"
  | "require_reauth"
  | "require_mfa"
  | "log_event"
  | "notify_admin"
  | "revoke_session"
  | "revoke_all_sessions";
