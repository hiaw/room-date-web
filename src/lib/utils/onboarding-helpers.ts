import type { OnboardingState } from "$lib/stores/onboarding.js";
import { validateDateOfBirth } from "./validation.js";

export interface LocationResult {
  latitude: number;
  longitude: number;
  location: string;
}

export function validateBasicInfo(
  state: OnboardingState,
  needsDateOfBirth = false,
): {
  isValid: boolean;
  errors: OnboardingState["validationErrors"];
} {
  const errors: OnboardingState["validationErrors"] = {};

  if (!state.displayName.trim()) {
    errors.displayName = "Display name is required";
  }

  if (needsDateOfBirth) {
    if (!state.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      const dobValidation = validateDateOfBirth(state.dateOfBirth);
      if (!dobValidation.valid) {
        errors.dateOfBirth = dobValidation.error || "Invalid date of birth";
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export async function getCurrentLocationData(): Promise<LocationResult> {
  if (!navigator.geolocation) {
    throw new Error("Geolocation is not supported by this browser");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Use coordinates as location description to avoid CSP issues
          const location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          resolve({ latitude, longitude, location });
        } catch (error) {
          console.error("Location processing failed:", error);
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const location = `${latitude?.toFixed(4) || "0"}, ${longitude?.toFixed(4) || "0"}`;
          resolve({ latitude, longitude, location });
        }
      },
      (error) => {
        console.error("Location error:", error);
        let errorMessage =
          "Could not get your location. You can add this later in settings.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. You can enable this later in settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. You can add this later in settings.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. You can add this later in settings.";
            break;
        }

        reject(new Error(errorMessage));
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  });
}
