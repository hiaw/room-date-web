# Quick Setup Reference

This is a quick reference for common setup scenarios. For complete instructions, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md).

## Scenario 1: Email/Password Only (Quickest)

```bash
# 1. Start Convex
npx convex dev
npx @convex-dev/auth

# 2. Start app
npm run dev

# ✅ Email/password auth works immediately
# JWT keys auto-generate on first sign-in
```

**What works:** Email/password registration and login  
**What doesn't:** Google OAuth (requires additional setup)

## Scenario 2: Google OAuth + Email/Password (Full Features)

### Prerequisites Checklist

- [ ] Google Cloud Console account
- [ ] OAuth client created
- [ ] Authorized redirect URIs configured

### Quick Commands

```bash
# 1. Get your Convex deployment URL
npx convex status

# 2. Set required environment variables
npx convex env set AUTH_GOOGLE_ID "your-google-client-id"
npx convex env set AUTH_GOOGLE_SECRET "your-google-client-secret"
npx convex env set SITE_URL "http://localhost:5174"

# 3. Start services
npx convex dev
npm run dev
```

### Google Cloud Console Setup

1. **Create OAuth Client** → Web Application
2. **Authorized JavaScript Origins:**
   ```
   http://localhost:5174
   ```
3. **Authorized Redirect URIs:**
   ```
   https://your-convex-deployment.convex.cloud/api/auth/callback/google
   ```

## Scenario 3: Production Deployment

```bash
# 1. Update environment for production
npx convex env set SITE_URL "https://your-domain.com"

# 2. Update Google OAuth settings
# Add production domain to authorized origins
# Add production Convex URL to redirect URIs

# 3. Deploy
npx convex deploy --cmd 'npm run build'
```

## Common Issues & Quick Fixes

| Error                         | Quick Fix                                                |
| ----------------------------- | -------------------------------------------------------- |
| `redirect_uri_mismatch`       | Check Google OAuth redirect URIs match exactly           |
| `AUTH_GOOGLE_ID is not set`   | Run `npx convex env set AUTH_GOOGLE_ID "your-id"`        |
| Google sign-in button missing | Verify `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set |
| JWT errors                    | Delete JWT env vars, restart - they'll auto-regenerate   |
| Local works, prod fails       | Update `SITE_URL` and Google OAuth for production        |

## Verification Commands

```bash
# Check environment variables
npx convex env list

# Test auth functions exist
npx convex run auth:store

# Check deployment status
npx convex status
```

## Need Help?

- **Complete guide:** [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
- **Project info:** [README.md](../README.md)
- **Current status:** [CONVEX_AUTH_SETUP.md](./CONVEX_AUTH_SETUP.md)

---

💡 **Tip:** Start with Scenario 1 to get up and running quickly, then add Google OAuth when needed.
