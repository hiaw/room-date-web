import { defineTable } from "convex/server";
import { v } from "convex/values";

// Images - centralized tracking of all uploaded images with ownership
export const images = defineTable({
  // R2 storage key (unique identifier)
  key: v.string(),
  // Owner of the image
  ownerId: v.id("users"),
  // What type of entity this image belongs to
  entityType: v.union(
    v.literal("user_profile"),
    v.literal("room"),
    v.literal("event"),
  ),
  // ID of the entity this image belongs to (optional for user_profile)
  entityId: v.optional(v.union(v.id("rooms"), v.id("events"))),
  // Whether this is the primary image for the entity
  isPrimary: v.boolean(),
  // Original filename for reference
  originalFileName: v.optional(v.string()),
  // Upload metadata
  uploadedAt: v.number(), // timestamp
  // File size in bytes (for quota tracking)
  sizeBytes: v.optional(v.number()),
  // MIME type
  mimeType: v.optional(v.string()),
})
  .index("by_key", ["key"]) // Fast ownership lookup by R2 key
  .index("by_owner", ["ownerId"]) // Get all images for a user
  .index("by_entity", ["entityType", "entityId"]) // Get all images for a room/event
  .index("by_owner_entity", ["ownerId", "entityType", "entityId"]) // Efficient queries
  .index("by_primary", ["entityType", "entityId", "isPrimary"]); // Find primary images

export const imageSchemas = {
  images,
};
