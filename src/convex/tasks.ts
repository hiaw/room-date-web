import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();
    return tasks;
  },
});

export const toggle = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to toggle tasks");
    }

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== userId) {
      throw new Error("Not authorized to modify this task");
    }

    await ctx.db.patch(args.id, {
      isCompleted: !task.isCompleted,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to remove tasks");
    }

    const task = await ctx.db.get(args.id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.userId !== userId) {
      throw new Error("Not authorized to delete this task");
    }

    await ctx.db.delete(args.id);
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Log unauthorized access attempt
      await ctx.db.insert("securityEvents", {
        eventType: "unauthorized_access",
        userId: undefined,
        identifier: undefined,
        metadata: { action: "create_task" },
        timestamp: Date.now(),
      });
      throw new Error("Must be logged in to create tasks");
    }

    // Input sanitization and validation (rate limiting removed)
    let sanitizedText = args.text.trim();

    // Remove control characters and normalize whitespace
    sanitizedText = sanitizedText.replace(
      // eslint-disable-next-line no-control-regex
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,
      "",
    );
    sanitizedText = sanitizedText.replace(/\s+/g, " ");

    // Remove potentially dangerous HTML characters
    sanitizedText = sanitizedText.replace(/[<>]/g, "");

    if (sanitizedText.length === 0) {
      throw new Error("Task text cannot be empty");
    }
    if (sanitizedText.length > 1000) {
      throw new Error("Task text cannot exceed 1000 characters");
    }

    const taskId = await ctx.db.insert("tasks", {
      text: sanitizedText,
      isCompleted: false,
      userId,
    });

    // Log successful task creation
    await ctx.db.insert("securityEvents", {
      eventType: "task_created",
      userId,
      identifier: undefined,
      metadata: { taskId, textLength: sanitizedText.length },
      timestamp: Date.now(),
    });

    return taskId;
  },
});
