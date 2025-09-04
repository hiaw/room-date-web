import type { Id } from "../../convex/_generated/dataModel";
import {
  CREDIT_CONSTANTS,
  validateCreditsForGuests,
} from "$lib/utils/credits.js";
import type { EventCreationState } from "$lib/stores/event-creation.js";

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEventCreation(
  state: EventCreationState,
  availableCredits: number,
): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!state.title.trim()) {
    errors.title = "Please enter an event title";
  } else if (state.title.trim().length < 3) {
    errors.title = "Event title must be at least 3 characters long";
  }

  // Description validation
  if (!state.description.trim()) {
    errors.description = "Please enter an event description";
  } else if (state.description.trim().length < 10) {
    errors.description =
      "Event description must be at least 10 characters long";
  }

  // Timing validation
  if (!state.isFlexibleTiming) {
    if (!state.startDate || !state.startTime) {
      errors.timing = "Please set a start date and time";
    }

    // End time validation if provided
    if (state.endDate && state.endTime && state.startDate && state.startTime) {
      const startTimestamp = new Date(
        `${state.startDate}T${state.startTime}`,
      ).getTime();
      const endTimestamp = new Date(
        `${state.endDate}T${state.endTime}`,
      ).getTime();

      if (endTimestamp <= startTimestamp) {
        errors.timing = "End time must be after start time";
      }
    }
  }

  // Guest count validation
  if (state.maxGuests) {
    if (
      state.maxGuests < CREDIT_CONSTANTS.MIN_GUESTS ||
      state.maxGuests > CREDIT_CONSTANTS.MAX_GUESTS_FALLBACK
    ) {
      errors.maxGuests = `Maximum guests must be between ${CREDIT_CONSTANTS.MIN_GUESTS} and ${CREDIT_CONSTANTS.MAX_GUESTS_FALLBACK}`;
    }

    // Credit validation
    const creditValidation = validateCreditsForGuests(
      state.maxGuests,
      availableCredits,
    );
    if (!creditValidation.isValid) {
      errors.credits = `Insufficient credits. Need ${state.maxGuests}, have ${availableCredits}`;
    }
  }

  // Age range validation
  if (state.minAge && state.maxAge && state.minAge > state.maxAge) {
    errors.ageRange = "Minimum age cannot be greater than maximum age";
  }

  if (state.minAge && (state.minAge < 18 || state.minAge > 100)) {
    errors.minAge = "Minimum age must be between 18 and 100";
  }

  if (state.maxAge && (state.maxAge < 18 || state.maxAge > 100)) {
    errors.maxAge = "Maximum age must be between 18 and 100";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildEventData(
  state: EventCreationState,
  roomId: Id<"rooms">,
): {
  roomId: Id<"rooms">;
  title: string;
  description?: string;
  startTime?: number;
  endTime?: number;
  isFlexibleTiming: boolean;
  maxGuests?: number;
  guestGenderPreferences?: string[];
  minAge?: number;
  maxAge?: number;
  eventImages: string[];
  primaryEventImageUrl?: string;
} {
  let startTimestamp: number | undefined;
  let endTimestamp: number | undefined;

  if (!state.isFlexibleTiming && state.startDate && state.startTime) {
    startTimestamp = new Date(
      `${state.startDate}T${state.startTime}`,
    ).getTime();

    if (state.endDate && state.endTime) {
      endTimestamp = new Date(`${state.endDate}T${state.endTime}`).getTime();
    }
  }

  return {
    roomId,
    title: state.title.trim(),
    description: state.description.trim() || undefined,
    startTime: startTimestamp,
    endTime: endTimestamp,
    isFlexibleTiming: state.isFlexibleTiming,
    maxGuests: state.maxGuests,
    guestGenderPreferences:
      state.guestGenderPreferences.length > 0
        ? state.guestGenderPreferences
        : undefined,
    minAge: state.minAge,
    maxAge: state.maxAge,
    eventImages: state.eventImages,
    primaryEventImageUrl: state.eventImages[0] || undefined,
  };
}
