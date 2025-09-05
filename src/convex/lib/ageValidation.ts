import { MIN_AGE_YEARS, AGE_ERROR_MESSAGE } from "../../lib/constants/age.js";

export function validateAge(dateOfBirth: string): {
  valid: boolean;
  error?: string;
  age?: number;
} {
  if (!dateOfBirth) {
    return { valid: false, error: "Date of birth is required" };
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return { valid: false, error: "Invalid date format" };
  }

  // Check if date is not in the future
  if (birthDate > today) {
    return { valid: false, error: "Date of birth cannot be in the future" };
  }

  // Calculate age
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  const dayDifference = today.getDate() - birthDate.getDate();

  // Adjust age if birthday hasn't occurred this year
  const actualAge =
    monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)
      ? age - 1
      : age;

  // Check if user is at minimum age
  if (actualAge < MIN_AGE_YEARS) {
    return {
      valid: false,
      error: AGE_ERROR_MESSAGE,
    };
  }

  return { valid: true, age: actualAge };
}
