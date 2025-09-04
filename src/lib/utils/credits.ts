/**
 * Credit-related constants and utilities
 */

// Constants
export const CREDIT_CONSTANTS = {
  LOW_CREDIT_THRESHOLD: 5,
  MAX_GUESTS_FALLBACK: 50,
  MIN_GUESTS: 1,
} as const;

// Types
export interface CreditValidationResult {
  isValid: boolean;
  error?: string;
  requiredCredits?: number;
  availableCredits?: number;
  shortfall?: number;
}

export interface CreditBalance {
  availableCredits: number;
  heldCredits: number;
  totalPurchased: number;
  totalUsed: number;
}

export interface ModalState {
  show: boolean;
  requiredCredits: number;
}

/**
 * Validates if user has sufficient credits for the requested number of guests
 */
export function validateCreditsForGuests(
  requestedGuests: number | undefined,
  availableCredits: number,
): CreditValidationResult {
  if (!requestedGuests || requestedGuests <= 0) {
    return { isValid: true };
  }

  if (availableCredits < requestedGuests) {
    const shortfall = requestedGuests - availableCredits;
    return {
      isValid: false,
      error: `Insufficient credits. Need ${requestedGuests}, have ${availableCredits}`,
      requiredCredits: requestedGuests,
      availableCredits,
      shortfall,
    };
  }

  return { isValid: true, availableCredits, requiredCredits: requestedGuests };
}

/**
 * Checks if user has low credits and should see warning
 */
export function isLowCreditBalance(
  creditBalance: CreditBalance | undefined,
): boolean {
  return (
    creditBalance?.availableCredits !== undefined &&
    creditBalance.availableCredits < CREDIT_CONSTANTS.LOW_CREDIT_THRESHOLD
  );
}

/**
 * Checks if user has no credits
 */
export function hasNoCredits(
  creditBalance: CreditBalance | undefined,
): boolean {
  return creditBalance?.availableCredits === 0;
}

/**
 * Gets the maximum guests allowed based on available credits
 */
export function getMaxGuestsAllowed(
  availableCredits: number | undefined,
): number {
  return availableCredits ?? CREDIT_CONSTANTS.MAX_GUESTS_FALLBACK;
}

/**
 * Formats credit count with proper pluralization
 */
export function formatCreditCount(count: number): string {
  return `${count} ${count === 1 ? "credit" : "credits"}`;
}

/**
 * Generates user-friendly error messages for credit validation
 */
export function getCreditErrorMessage(
  validation: CreditValidationResult,
): string {
  if (validation.isValid) return "";

  if (validation.availableCredits === 0) {
    return "You need credits to create events with guest limits.";
  }

  return `You need ${formatCreditCount(
    validation.requiredCredits!,
  )} to create this event, but only have ${formatCreditCount(
    validation.availableCredits!,
  )} available.`;
}
