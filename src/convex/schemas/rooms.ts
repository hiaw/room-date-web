import { defineTable } from "convex/server";
import { v } from "convex/values";

// Rooms - physical spaces that can host events
export const rooms = defineTable({
  ownerId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  address: v.optional(v.string()),
  streetAddress: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  zipCode: v.optional(v.string()),
  country: v.optional(v.string()),
  // Geolocation for "events near me"
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  locationVerified: v.boolean(),
  // Media support
  images: v.optional(v.array(v.string())), // R2 keys for room photos
  primaryImageUrl: v.optional(v.string()), // Primary R2 key
  isActive: v.boolean(),
})
  .index("by_owner", ["ownerId"])
  .index("by_active", ["isActive"])
  .index("by_city", ["city"])
  .index("by_location", ["latitude", "longitude"]) // For geospatial queries
  .index("by_active_location", ["isActive", "latitude", "longitude"]);

export const roomSchemas = {
  rooms,
};
