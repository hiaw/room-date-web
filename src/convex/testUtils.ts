import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const cleanupTestUser = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      console.log(`Test user with email ${args.email} not found`);
      return;
    }

    // Delete all tasks for this user
    const userTasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const task of userTasks) {
      await ctx.db.delete(task._id);
    }

    // Delete the user
    await ctx.db.delete(user._id);

    console.log(
      `Cleaned up test user ${args.email} and ${userTasks.length} tasks`,
    );
    return { userId: user._id, tasksDeleted: userTasks.length };
  },
});

export const cleanupTestTasks = internalMutation({
  args: {
    userId: v.id("users"),
    taskText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("userId"), args.userId));

    if (args.taskText) {
      query = query.filter((q) => q.eq(q.field("text"), args.taskText));
    }

    const tasks = await query.collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    console.log(
      `Cleaned up ${tasks.length} test tasks for user ${args.userId}`,
    );
    return { tasksDeleted: tasks.length };
  },
});

export const findUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    return user;
  },
});
