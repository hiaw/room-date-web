# Admin Management Guide

## Overview

The application now includes a secure admin role system to protect sensitive operations like refund management. This document explains how the admin system works and how to manage admin users.

## Admin Authorization System

### Schema Changes

- Added `isAdmin: boolean` field to the `userProfiles` table
- New users are set to `isAdmin: false` by default during account creation

### Security Functions

The following admin helper functions are available in `src/convex/lib/authHelpers.ts`:

- `requireAdmin(ctx)` - Throws error if user is not admin
- `isAdmin(ctx, userId)` - Returns boolean indicating if user is admin
- `getCurrentUserWithAdminStatus(ctx)` - Returns user ID and admin status

### Protected Operations

The following functions now require admin privileges:

1. **`getPendingRefundRequests`** - View all pending refund requests
2. **`reviewRefundRequest`** - Approve or reject refund requests
3. **`getRefundRequestById`** - Admins can view any refund request (users can only view their own)

## How to Grant Admin Privileges

### Option 1: Manual Database Update (Development)

```javascript
// In Convex dashboard, run this mutation:
await ctx.db.patch("userProfiles:[USER_PROFILE_ID]", {
  isAdmin: true,
});
```

### Option 2: Create Admin Management Mutation

Add this mutation to your Convex functions for easier admin management:

```typescript
// src/convex/admin.ts
export const grantAdminRole = mutation({
  args: { targetUserId: v.id("users") },
  handler: async (ctx, args) => {
    // Only existing admins can grant admin role
    await requireAdmin(ctx);

    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .unique();

    if (!userProfile) {
      throw new Error("User profile not found");
    }

    await ctx.db.patch(userProfile._id, { isAdmin: true });
    return { success: true };
  },
});
```

### Option 3: Environment Variable Admin (Recommended)

For the first admin user, you can check against a hardcoded email:

```typescript
// In authHelpers.ts, modify isAdmin function:
export async function isAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<boolean> {
  // Check for super admin email (for bootstrapping first admin)
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
  if (SUPER_ADMIN_EMAIL) {
    const user = await ctx.db.get(userId);
    if (user?.email === SUPER_ADMIN_EMAIL) {
      return true;
    }
  }

  // Check database admin flag
  const userProfile = await ctx.db
    .query("userProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  return userProfile?.isAdmin === true;
}
```

Then set the environment variable:

```bash
npx convex env set SUPER_ADMIN_EMAIL admin@yourdomain.com
```

## Security Implications

### Before This Fix

❌ **Critical Security Vulnerabilities:**

- Any authenticated user could view all pending refund requests
- Any authenticated user could approve/reject refunds (potential financial fraud)
- No audit trail of who performed admin actions

### After This Fix

✅ **Security Improvements:**

- Only users with `isAdmin: true` can access admin functions
- Proper authorization checks on all sensitive operations
- Admin actions are logged with the actual admin user ID
- Clear separation between user and admin privileges

## Testing Admin Functions

### Test Admin Authorization

```bash
# This should fail for non-admin users:
convex run refunds:getPendingRefundRequests

# This should fail for non-admin users:
convex run refunds:reviewRefundRequest --refundRequestId="..." --decision="approved"
```

### Test Regular User Access

```bash
# Regular users can still view their own refund requests:
convex run refunds:getRefundRequestById --refundRequestId="[THEIR_OWN_REQUEST_ID]"

# But cannot view others' requests:
convex run refunds:getRefundRequestById --refundRequestId="[SOMEONE_ELSE_REQUEST_ID]"
```

## Migration Notes

- Existing users will have `isAdmin: undefined`, which evaluates to `false` in the admin checks
- New users automatically get `isAdmin: false`
- No database migration is required - the schema change is backward compatible
- The first admin user must be manually promoted using one of the methods above

## Best Practices

1. **Principle of Least Privilege**: Only grant admin access to users who absolutely need it
2. **Audit Trail**: All admin actions are logged in the `securityEvents` table
3. **Environment Variables**: Use `SUPER_ADMIN_EMAIL` for bootstrapping the first admin
4. **Regular Review**: Periodically review who has admin access
5. **Secure Communication**: Use secure channels when sharing admin credentials

## Error Messages

Users will now see clear error messages when attempting unauthorized operations:

- `"Admin privileges required for this operation"` - When non-admin tries admin function
- `"Access denied - you can only view your own refund requests"` - When user tries to view others' data

This admin system provides the foundation for secure financial operations and can be extended to protect other sensitive features as needed.
