import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Get all dashboard data for authenticated user in a single query
 * This reduces function calls by batching related queries
 */
export const getUserDashboard = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        rooms: [],
        events: [],
        applications: [],
        creditBalance: null,
      };
    }

    // Batch all related queries
    const [rooms, events, applications, creditTransactions] = await Promise.all(
      [
        // My rooms
        ctx.db
          .query("rooms")
          .withIndex("by_owner", (q) => q.eq("ownerId", userId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect(),

        // My events
        ctx.db
          .query("events")
          .withIndex("by_owner", (q) => q.eq("ownerId", userId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect(),

        // My applications
        ctx.db
          .query("eventApplications")
          .withIndex("by_applicant", (q) => q.eq("applicantId", userId))
          .collect(),

        // Credit balance (latest transactions)
        ctx.db
          .query("creditTransactions")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .order("desc")
          .take(5),
      ],
    );

    // Calculate credit balance from transactions
    const totalCredits = creditTransactions.reduce((sum: number, tx) => {
      // Positive amounts for purchases, initial grants, refunds, releases
      // Negative amounts for deductions and holds
      const isPositive =
        tx.type === "purchase" ||
        tx.type === "initial_grant" ||
        tx.type === "refund" ||
        tx.type === "release";
      return sum + (isPositive ? Math.abs(tx.amount) : -Math.abs(tx.amount));
    }, 0);

    return {
      rooms,
      events,
      applications,
      creditBalance: totalCredits,
      recentCreditTransactions: creditTransactions,
    };
  },
});
