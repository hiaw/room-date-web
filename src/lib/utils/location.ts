// Location and address utilities
import type { Room } from "../types";

export function formatAddress(room: Room): string {
  if (room.address) return room.address;

  const addressParts = [
    room.streetAddress,
    room.city,
    room.state,
    room.zipCode,
    room.country,
  ].filter(Boolean);

  return addressParts.length > 0
    ? addressParts.join(", ")
    : "No address specified";
}

// Mobile-specific utilities
export function isMobileViewport(width: number): boolean {
  return width < 768;
}

export function isTabletViewport(width: number): boolean {
  return width >= 768 && width < 1024;
}

export function getOptimalImageSize(
  width: number,
): "small" | "medium" | "large" {
  if (width < 400) return "small";
  if (width < 800) return "medium";
  return "large";
}
