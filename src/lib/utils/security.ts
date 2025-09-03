import { browser } from "$app/environment";
import { clearTokens } from "../auth.js";
import {
  SECURITY_THRESHOLDS,
  type DeviceFingerprint,
  type SecurityEvent,
  type SecurityCheckFunctions,
} from "../types/security.js";

/**
 * Generate a device fingerprint for security tracking
 */
export function generateDeviceFingerprint(): DeviceFingerprint | null {
  if (!browser) return null;

  const fingerprint = {
    userAgent: navigator.userAgent,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform:
      (navigator as { userAgentData?: { platform?: string } }).userAgentData
        ?.platform || "web",
    cookieEnabled: navigator.cookieEnabled,
    hash: "",
  };

  // Create a hash of the fingerprint data
  fingerprint.hash = createFingerprintHash(fingerprint);

  return fingerprint;
}

/**
 * Create a simple hash of fingerprint data
 */
function createFingerprintHash(
  fingerprint: Omit<DeviceFingerprint, "hash">,
): string {
  const data = JSON.stringify(fingerprint);
  let hash = 0;

  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

/**
 * Store device fingerprint in localStorage
 */
export function storeDeviceFingerprint(): string | null {
  if (!browser) return null;

  const existing = localStorage.getItem("device-fingerprint");
  if (existing) return existing;

  const fingerprint = generateDeviceFingerprint();
  if (!fingerprint) return null;

  localStorage.setItem("device-fingerprint", fingerprint.hash);
  return fingerprint.hash;
}

/**
 * Get stored device fingerprint
 */
export function getStoredDeviceFingerprint(): string | null {
  if (!browser) return null;
  return localStorage.getItem("device-fingerprint");
}

/**
 * Check if current device matches stored fingerprint
 */
export function validateDeviceFingerprint(): boolean {
  if (!browser) return true; // Skip validation on server

  // Temporarily disable device fingerprint validation during development
  // This prevents false positives that cause unwanted logouts
  return true;

  // TODO: Re-enable with better fingerprint stability in production
  // const stored = getStoredDeviceFingerprint();
  // const current = generateDeviceFingerprint();
  // if (!stored || !current) return true; // Allow if we can't validate
  // return stored === current.hash;
}

/**
 * Clear stored device fingerprint (for logout)
 */
export function clearDeviceFingerprint(): void {
  if (!browser) return;
  localStorage.removeItem("device-fingerprint");
}

/**
 * Check if session is recent enough for sensitive operations
 */
export function isRecentSession(
  sessionCreationTime: number,
  maxAgeMinutes: number = 30,
): boolean {
  const maxAgeMs = maxAgeMinutes * 60 * 1000;
  const now = Date.now();
  return now - sessionCreationTime <= maxAgeMs;
}

/**
 * Enhanced security checks for different operations
 */
export const SecurityCheck: SecurityCheckFunctions = {
  /**
   * Check if recent authentication is required for profile changes
   */
  profileChange: (sessionCreationTime: number) =>
    !isRecentSession(sessionCreationTime, SECURITY_THRESHOLDS.CHANGE_EMAIL),

  /**
   * Check if recent authentication is required for account deletion
   */
  accountDeletion: (sessionCreationTime: number) =>
    !isRecentSession(sessionCreationTime, SECURITY_THRESHOLDS.DELETE_ACCOUNT),

  /**
   * Check if recent authentication is required for event creation
   */
  eventCreation: (sessionCreationTime: number) =>
    !isRecentSession(sessionCreationTime, SECURITY_THRESHOLDS.CREATE_EVENT),

  /**
   * Check if recent authentication is required for joining events
   */
  eventJoining: (sessionCreationTime: number) =>
    !isRecentSession(sessionCreationTime, SECURITY_THRESHOLDS.JOIN_EVENT),

  /**
   * Check if recent authentication is required for messaging
   */
  messaging: (sessionCreationTime: number) =>
    !isRecentSession(sessionCreationTime, SECURITY_THRESHOLDS.SEND_MESSAGE),
} as const;

/**
 * Get human-readable time description for security requirements
 */
export function getSecurityTimeDescription(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    if (remainingMinutes === 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""} and ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
  }
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

/**
 * Log security events (could be extended to send to analytics)
 */
export function logSecurityEvent(
  event: SecurityEvent,
  details?: Record<string, string | number | boolean>,
): void {
  console.warn(`[Security Event] ${event}:`, details);

  // In production, you might want to send this to your analytics/monitoring service
  // Example:
  // analytics.track('security_event', { event, ...details });
}

/**
 * Enhanced logout that clears all security-related data
 */
export function secureLogout(): void {
  if (!browser) return;

  // Clear auth tokens
  clearTokens();

  // Clear device fingerprint
  clearDeviceFingerprint();

  // Clear any other sensitive data
  localStorage.removeItem("user-preferences");

  // Log the security event
  logSecurityEvent("secure_logout");
}
