import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const updateConnectionNote = mutation({
  args: {
    connectionId: v.id("connections"),
    nickname: v.optional(v.string()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { connectionId, nickname, notes, tags }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is part of this connection
    const connection = await ctx.db.get(connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    if (connection.user1Id !== userId && connection.user2Id !== userId) {
      throw new Error("Access denied to this connection");
    }

    // Check if note already exists
    const existingNote = await ctx.db
      .query("connectionNotes")
      .withIndex("by_connection_user", (q) =>
        q.eq("connectionId", connectionId).eq("userId", userId),
      )
      .first();

    if (existingNote) {
      // Update existing note
      return await ctx.db.patch(existingNote._id, {
        nickname,
        notes,
        tags,
        lastUpdated: Date.now(),
      });
    } else {
      // Create new note
      return await ctx.db.insert("connectionNotes", {
        connectionId,
        userId,
        nickname,
        notes,
        tags,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const deleteConnectionNote = mutation({
  args: {
    connectionId: v.id("connections"),
  },
  handler: async (ctx, { connectionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Find and delete the note
    const note = await ctx.db
      .query("connectionNotes")
      .withIndex("by_connection_user", (q) =>
        q.eq("connectionId", connectionId).eq("userId", userId),
      )
      .first();

    if (note) {
      await ctx.db.delete(note._id);
    }

    return { success: true };
  },
});
