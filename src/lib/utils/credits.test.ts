import { describe, it, expect } from "vitest";
import {
  validateCreditsForGuests,
  isLowCreditBalance,
  hasNoCredits,
  formatCreditCount,
  getMaxGuestsAllowed,
  getCreditErrorMessage,
  CREDIT_CONSTANTS,
  type CreditBalance,
} from "./credits";

describe("Credit Utilities", () => {
  const mockCreditBalance: CreditBalance = {
    availableCredits: 3,
    heldCredits: 1,
    totalPurchased: 10,
    totalUsed: 6,
  };

  const emptyCreditBalance: CreditBalance = {
    availableCredits: 0,
    heldCredits: 0,
    totalPurchased: 0,
    totalUsed: 0,
  };

  describe("validateCreditsForGuests", () => {
    it("should return valid for no guests", () => {
      const result = validateCreditsForGuests(undefined, 5);
      expect(result.isValid).toBe(true);
    });

    it("should return valid when user has sufficient credits", () => {
      const result = validateCreditsForGuests(3, 5);
      expect(result.isValid).toBe(true);
      expect(result.availableCredits).toBe(5);
      expect(result.requiredCredits).toBe(3);
    });

    it("should return invalid when user has insufficient credits", () => {
      const result = validateCreditsForGuests(5, 3);
      expect(result.isValid).toBe(false);
      expect(result.shortfall).toBe(2);
      expect(result.error).toContain("Insufficient credits");
    });
  });

  describe("isLowCreditBalance", () => {
    it("should return true for low credits", () => {
      const lowBalance = { ...mockCreditBalance, availableCredits: 2 };
      expect(isLowCreditBalance(lowBalance)).toBe(true);
    });

    it("should return false for sufficient credits", () => {
      const goodBalance = { ...mockCreditBalance, availableCredits: 10 };
      expect(isLowCreditBalance(goodBalance)).toBe(false);
    });

    it("should return false for undefined balance", () => {
      expect(isLowCreditBalance(undefined)).toBe(false);
    });
  });

  describe("hasNoCredits", () => {
    it("should return true for zero credits", () => {
      expect(hasNoCredits(emptyCreditBalance)).toBe(true);
    });

    it("should return false for available credits", () => {
      expect(hasNoCredits(mockCreditBalance)).toBe(false);
    });

    it("should return false for undefined balance", () => {
      expect(hasNoCredits(undefined)).toBe(false);
    });
  });

  describe("formatCreditCount", () => {
    it("should format singular credit", () => {
      expect(formatCreditCount(1)).toBe("1 credit");
    });

    it("should format plural credits", () => {
      expect(formatCreditCount(5)).toBe("5 credits");
      expect(formatCreditCount(0)).toBe("0 credits");
    });
  });

  describe("getMaxGuestsAllowed", () => {
    it("should return available credits when defined", () => {
      expect(getMaxGuestsAllowed(5)).toBe(5);
    });

    it("should return fallback when undefined", () => {
      expect(getMaxGuestsAllowed(undefined)).toBe(
        CREDIT_CONSTANTS.MAX_GUESTS_FALLBACK,
      );
    });
  });

  describe("getCreditErrorMessage", () => {
    it("should return empty string for valid validation", () => {
      const validation = { isValid: true };
      expect(getCreditErrorMessage(validation)).toBe("");
    });

    it("should return zero credits message", () => {
      const validation = {
        isValid: false,
        availableCredits: 0,
        requiredCredits: 3,
        shortfall: 3,
      };
      const message = getCreditErrorMessage(validation);
      expect(message).toBe(
        "You need credits to create events with guest limits.",
      );
    });

    it("should return insufficient credits message", () => {
      const validation = {
        isValid: false,
        availableCredits: 2,
        requiredCredits: 5,
        shortfall: 3,
      };
      const message = getCreditErrorMessage(validation);
      expect(message).toContain("You need 5 credits");
      expect(message).toContain("only have 2 credits");
    });
  });
});
