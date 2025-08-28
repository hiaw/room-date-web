import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Must be authenticated");
  }
  return userId;
}

export async function optionalAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<string | null> {
  return await getAuthUserId(ctx);
}
