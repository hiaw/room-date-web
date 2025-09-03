import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api.js";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server.js";
import { v } from "convex/values";

export const r2 = new R2(components.r2);

// Client API functions for R2 operations
export const { generateUploadUrl, syncMetadata } = r2.clientApi({
  checkUpload: async (ctx, _bucket) => {
    // Validate that user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to upload images");
    }

    // Additional validation can be added here:
    // - Check user's upload quota
    // - Validate file type (done on client side as well)
    // - Check user permissions
  },

  onUpload: async (_ctx, _bucket, _key) => {
    // This runs after successful upload
    // You can add additional logic here:
    // - Update user's storage quota
    // - Create database records linking images to users/rooms/events
    // - Send notifications
    // - Analytics tracking
  },
});

// Custom upload function with folder organization
export const uploadToFolder = mutation({
  args: {
    folder: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, { folder, fileName }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to upload images");
    }

    // Generate organized key with folder structure
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const key = `${folder}/${timestamp}-${randomId}-${cleanFileName}`;

    // Generate upload URL
    const uploadResult = await r2.generateUploadUrl(key);

    // Extract URL from the result object
    const uploadUrl =
      typeof uploadResult === "string" ? uploadResult : uploadResult.url;

    return {
      uploadUrl,
      key,
    };
  },
});

// Helper function to generate short-lived image URLs
export const getImageUrl = mutation({
  args: { key: v.string(), expiresInSeconds: v.optional(v.number()) },
  handler: async (ctx, { key, expiresInSeconds = 900 }) => {
    // Validate user is authenticated to view images
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to view images");
    }

    // Default expiration is 15 minutes (900 seconds)
    // You can customize this per use case:
    // - Profile images: longer expiration (1 hour = 3600)
    // - Sensitive room images: shorter expiration (5 minutes = 300)
    return await r2.getUrl(key, { expiresIn: expiresInSeconds });
  },
});

// Helper function to delete images from R2
export const deleteImage = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to delete images");
    }

    // TODO: Add additional validation here to ensure user owns the image
    // You might want to check if the key belongs to the user's rooms/events/profile

    return await r2.deleteObject(ctx, key);
  },
});

// Helper function to delete multiple images from R2
export const deleteImages = mutation({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to delete images");
    }

    // Delete all images in parallel
    const deletePromises = keys.map((key) => r2.deleteObject(ctx, key));
    return await Promise.all(deletePromises);
  },
});
