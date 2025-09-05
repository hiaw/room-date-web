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

  // Check if user is 18 or older
  if (actualAge < 18) {
    return {
      valid: false,
      error: "You must be 18 or older to join Room Dates",
    };
  }

  return { valid: true, age: actualAge };
}
