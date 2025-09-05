// Age validation constants
export const MIN_AGE_YEARS = 18;
export const DAYS_PER_YEAR = 365.25;
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Calculate the maximum birth date for minimum age requirement
export const getMaxBirthDate = (): string => {
  const maxDate = new Date(
    Date.now() - MIN_AGE_YEARS * DAYS_PER_YEAR * MS_PER_DAY,
  );
  return maxDate.toISOString().split("T")[0];
};

// Standard error message for age validation
export const AGE_ERROR_MESSAGE = "You must be 18 or older to join Room Dates";
