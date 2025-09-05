import { validateAge } from "../../convex/lib/ageValidation.js";
import { getMaxBirthDate } from "../constants/age.js";

export function validateEmail(email: string): boolean {
  // More robust email validation regex that follows RFC 5322 standards
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Basic format check
  if (!emailRegex.test(email)) {
    return false;
  }

  // Additional validation checks
  const [localPart, domainPart] = email.split("@");

  // Check local part length (before @)
  if (localPart.length > 64) {
    return false;
  }

  // Check domain part length (after @)
  if (domainPart.length > 253) {
    return false;
  }

  // Check overall email length
  if (email.length > 320) {
    return false;
  }

  // Check for consecutive dots
  if (email.includes("..")) {
    return false;
  }

  // Check if starts or ends with dot
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return false;
  }

  return true;
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=[\]{}|;':".,<>?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return { valid: errors.length === 0, errors };
}

export function validateDateOfBirth(dateOfBirth: string): {
  valid: boolean;
  error?: string;
} {
  // Use the same validation logic as the server
  return validateAge(dateOfBirth);
}

export function getMaxDateOfBirth(): string {
  // Use centralized function for consistency
  return getMaxBirthDate();
}

export function validateAuthForm(
  email: string,
  password: string,
  dateOfBirth?: string,
): string[] {
  const errors: string[] = [];

  if (!validateRequired(email)) {
    errors.push("Email is required");
  } else if (!validateEmail(email)) {
    errors.push("Please enter a valid email address");
  }

  if (!validateRequired(password)) {
    errors.push("Password is required");
  } else {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }
  }

  // Validate date of birth if provided (for signup)
  if (dateOfBirth !== undefined) {
    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.valid && dobValidation.error) {
      errors.push(dobValidation.error);
    }
  }

  return errors;
}
