// User display utility functions

/**
 * Get user initials from display name
 * Takes first letter of each word, up to 2 letters
 */
export function getUserInitials(name: string): string {
  if (!name || name.trim() === "") return "??";

  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get display name with fallback handling
 * Priority: nickname > profile display name > fallback
 */
export function getConnectionDisplayName(
  nickname?: string,
  profileDisplayName?: string,
  fallback: string = "Unknown User",
): string {
  return nickname?.trim() || profileDisplayName?.trim() || fallback;
}

/**
 * Check if nickname is different from actual profile name
 * Used to show "aka" labels
 */
export function hasCustomNickname(
  nickname?: string,
  profileDisplayName?: string,
): boolean {
  if (!nickname?.trim()) return false;
  return nickname.trim() !== (profileDisplayName?.trim() || "");
}
