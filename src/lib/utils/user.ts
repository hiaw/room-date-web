// User profile utilities
import type { UserProfile, UserWithProfile } from "../types";

interface User {
  name?: string;
  email?: string;
}

export function formatUserName(userData: User | null | undefined): string {
  if (!userData) return "User";
  return userData.name || userData.email || "User";
}

export function getUserDisplayName(
  user: User | string | null | undefined,
): string {
  if (!user) return "User";
  if (typeof user === "string") return user;
  return formatUserName(user);
}

export function calculateAge(dateOfBirth: number): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function getDisplayName(user: UserWithProfile): string {
  return (
    user.profile?.displayName ||
    user.displayName ||
    user.name ||
    user.email ||
    "Anonymous"
  );
}

export function isProfileComplete(profile: UserProfile): boolean {
  return !!(profile.displayName && profile.dateOfBirth && profile.bio);
}

export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
