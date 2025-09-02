// Security and Authentication Types for Convex

// Security Event Types
export type SecurityEventType =
  | "multiple_failed_logins"
  | "device_fingerprint_mismatch"
  | "rapid_session_creation"
  | "token_reuse_detected"
  | "suspicious_login_pattern"
  | "account_lockout"
  | "password_breach_detected"
  | "unusual_location_access";

// Security Event Details
export interface SecurityEventDetails {
  attemptCount?: number;
  sessionCount?: number;
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  previousLocation?: string;
  timestamp?: number;
  riskScore?: number;
  [key: string]: any; // Allow additional custom details
}

// Security Monitoring Arguments
export interface SecurityMonitoringArgs {
  eventType: SecurityEventType;
  deviceFingerprint?: string;
  userAgent?: string;
  details?: SecurityEventDetails;
}

// Security Actions Response
export interface SecurityActionResult {
  success: boolean;
  actionsTaken: {
    revokedSessions: boolean;
    accountLocked?: boolean;
    notificationSent?: boolean;
    escalated?: boolean;
  };
  message?: string;
  nextAction?:
    | "verify_identity"
    | "contact_support"
    | "change_password"
    | "allow";
}

// Login Security Check Arguments
export interface LoginSecurityCheckArgs {
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
}

// Login Security Check Result
export interface LoginSecurityResult {
  isSuspicious: boolean;
  recentSessionCount: number;
  recommendedAction: "verify_identity" | "allow" | "block" | "require_mfa";
  riskScore?: number;
  reasons?: string[];
  warnings?: string[];
}

// Session Security Info
export interface SessionSecurityInfo {
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
  lastActivity: number;
  createdAt: number;
  isCurrentSession?: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
}

// Security Rule Configuration
export interface SecurityRuleConfig {
  maxFailedLogins: number;
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  rapidSessionThreshold: number;
  suspiciousActivityWindow: number; // in minutes
  autoRevokeOnSuspiciousActivity: boolean;
  requireMfaForHighRisk: boolean;
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityRuleConfig = {
  maxFailedLogins: 5,
  sessionTimeoutMinutes: 60 * 24, // 24 hours
  maxConcurrentSessions: 5,
  rapidSessionThreshold: 3,
  suspiciousActivityWindow: 15,
  autoRevokeOnSuspiciousActivity: true,
  requireMfaForHighRisk: false,
};
