export function validateEventTiming(
  startTime: number | undefined,
  endTime: number | undefined,
) {
  if (startTime && endTime) {
    if (startTime >= endTime) {
      throw new Error("End time must be after start time");
    }
    if (startTime < Date.now()) {
      throw new Error("Event cannot start in the past");
    }
  }
}

export function validateAgeRange(
  minAge: number | undefined,
  maxAge: number | undefined,
) {
  if (minAge && maxAge && minAge > maxAge) {
    throw new Error("Minimum age cannot be greater than maximum age");
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateUserAge(dateOfBirth: number): number {
  return Math.floor(
    (Date.now() - dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000),
  );
}
