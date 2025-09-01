# Authentication Setup Guide

This guide walks you through setting up authentication for your Convex + Svelte project. The project supports both **Google OAuth** and **email/password** authentication using @convex-dev/auth.

## Prerequisites

Before you begin, make sure you have:

- ✅ A [Google Cloud Console](https://console.cloud.google.com) account
- ✅ A [Convex](https://convex.dev) account and project set up
- ✅ The project cloned and dependencies installed (`npm install`)
- ✅ Convex development environment initialized (`npx convex dev`)

## Account Linking

**✨ NEW**: Users with the same email address are automatically recognized as the same account regardless of login method.

### How It Works

- **First Login**: User creates account with email/password
- **Subsequent Login**: User logs in with Google OAuth using the same email
- **Result**: Both authentication methods are linked to the same user account

### Features

- **Seamless Experience**: No duplicate accounts for the same email
- **Profile Merging**: OAuth profile data (name, image) enhances existing accounts
- **Data Preservation**: All user data (rooms, events, connections) stays with the original account
- **Automatic Linking**: Happens transparently during login - no user action required

### Technical Implementation

The system uses a custom `createOrUpdateUser` callback in `src/convex/auth.ts` that:

1. **During new sign-ups**: Checks if a user with the same email already exists
2. **If exists**: Links the new authentication method to the existing user account
3. **Profile Enhancement**: Updates existing user with any missing profile data from OAuth
4. **If doesn't exist**: Creates a new account as normal

This ensures that email addresses serve as the unique identifier for user accounts across all authentication methods.

## Environment Variables

Your Convex deployment needs these environment variables to enable authentication:

| Variable             | Description                           | Required For       |
| -------------------- | ------------------------------------- | ------------------ |
| `AUTH_GOOGLE_ID`     | Google OAuth Client ID                | Google Sign-In     |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret            | Google Sign-In     |
| `JWKS`               | JSON Web Key Set for JWT verification | All authentication |
| `JWT_PRIVATE_KEY`    | Private key for JWT signing           | All authentication |
| `SITE_URL`           | Your application's URL                | OAuth redirects    |

## Step-by-Step Setup

### 1. Google Cloud Console Configuration

#### Create a Google Cloud Project (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Note your project ID for reference

#### Enable Google+ API

1. Navigate to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click **Enable**

#### Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure the OAuth consent screen if prompted:
   - **Application name**: Your app name
   - **User support email**: Your email
   - **Developer contact information**: Your email

#### Configure Authorized URLs

This is the **critical step** for OAuth to work properly:

1. In your OAuth 2.0 client configuration:

2. **Authorized JavaScript origins:**

   ```
   http://localhost:5174
   https://your-production-domain.com
   ```

3. **Authorized redirect URIs:**

   ```
   https://your-convex-deployment.convex.cloud/api/auth/callback/google
   http://localhost:5174/api/auth/callback/google
   ```

   > ⚠️ **Important**: Replace `your-convex-deployment` with your actual Convex deployment URL. You can find this in your Convex dashboard or by running `npx convex status`.

4. Click **Save** to create the credentials

5. **Copy your credentials:**
   - **Client ID**: Looks like `163002814291-xxxxx.apps.googleusercontent.com`
   - **Client Secret**: Looks like `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

### 2. Set Convex Environment Variables

#### Option A: Using Convex Dashboard (Recommended)

1. Go to your [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Navigate to **Settings** > **Environment Variables**
4. Add each variable:

```bash
# Google OAuth Credentials
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Your application URL
SITE_URL=http://localhost:5174  # For development
# SITE_URL=https://your-domain.com  # For production
```

#### Option B: Using Convex CLI

```bash
# Set Google OAuth credentials
npx convex env set AUTH_GOOGLE_ID your-google-client-id
npx convex env set AUTH_GOOGLE_SECRET your-google-client-secret

# Set your site URL
npx convex env set SITE_URL http://localhost:5174
```

#### JWT Keys (Auto-generated)

The `JWKS` and `JWT_PRIVATE_KEY` variables should be automatically generated by Convex Auth. If they're missing, you can generate them:

```bash
# This will auto-generate JWT keys on first auth request
npm run dev
# Then try to sign in - keys will be created automatically
```

### 3. Update Your Local Environment

Create a `.env.local` file in your project root (copy from `.env.example`):

```env
# Convex deployment info (auto-generated by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment-name
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### 4. Test Your Setup

1. **Start your development servers:**

   ```bash
   # Terminal 1: Start Convex
   npx convex dev

   # Terminal 2: Start SvelteKit
   npm run dev
   ```

2. **Open your app:** http://localhost:5174

3. **Test Google Sign-In:**
   - Click "Sign in with Google"
   - You should be redirected to Google's OAuth flow
   - After authorization, you should be redirected back to your app

4. **Test Email/Password:**
   - Try creating an account with email/password
   - Both authentication methods should work

## Troubleshooting

### Common Issues

#### "OAuth Error: redirect_uri_mismatch"

**Problem:** Google OAuth redirect URI doesn't match your configuration.

**Solution:**

1. Check your Google Cloud Console OAuth configuration
2. Ensure the redirect URI exactly matches: `https://your-convex-deployment.convex.cloud/api/auth/callback/google`
3. Make sure there are no trailing slashes or typos

#### "Environment variable AUTH_GOOGLE_ID is not set"

**Problem:** Environment variables aren't configured in Convex.

**Solution:**

1. Verify variables are set in Convex Dashboard or via CLI
2. Restart your Convex dev server: `npx convex dev`
3. Check that variables appear when running: `npx convex env list`

#### Authentication works locally but fails in production

**Problem:** Environment variables or OAuth configuration not updated for production.

**Solution:**

1. Update `SITE_URL` to your production domain
2. Add production domain to Google OAuth authorized origins
3. Update redirect URI to use production Convex URL
4. Deploy environment variables to production Convex deployment

#### "Invalid JWT" or token-related errors

**Problem:** JWT keys are missing or corrupted.

**Solution:**

1. Check that `JWKS` and `JWT_PRIVATE_KEY` exist: `npx convex env list`
2. If missing, they should auto-generate on first auth attempt
3. For manual generation, delete existing keys and restart the auth flow

### Verification Commands

```bash
# Check all environment variables are set
npx convex env list

# Check your Convex deployment status
npx convex status

# Test your Convex functions
npx convex run auth:store
```

## Security Best Practices

### Environment Variables

- ✅ **Never commit** actual environment variables to version control
- ✅ Use different Google OAuth clients for development/production
- ✅ Keep your Google client secret secure
- ✅ Rotate credentials periodically

### OAuth Configuration

- ✅ Only add necessary redirect URIs
- ✅ Use HTTPS in production
- ✅ Regularly review OAuth consent screen settings
- ✅ Monitor authentication logs in Google Cloud Console

### Convex Security

- ✅ Use Convex's built-in authentication checks in your queries/mutations
- ✅ Never expose sensitive data in client-side queries
- ✅ Implement proper user authorization in your Convex functions

## Production Deployment

When deploying to production:

1. **Update environment variables:**

   ```bash
   npx convex env set SITE_URL https://your-production-domain.com
   ```

2. **Update Google OAuth configuration:**
   - Add production domain to authorized origins
   - Add production Convex URL to redirect URIs

3. **Deploy Convex:**

   ```bash
   npx convex deploy --cmd 'npm run build'
   ```

4. **Deploy your frontend** to your hosting platform (Vercel, Netlify, etc.)

## Getting Help

If you run into issues:

1. **Check the Convex Dashboard** for deployment logs and errors
2. **Review Google Cloud Console** OAuth configuration
3. **Consult documentation:**
   - [Convex Auth Documentation](https://labs.convex.dev/auth)
   - [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
4. **Check browser console** for client-side errors
5. **Verify network requests** in browser dev tools

## Next Steps

Once authentication is working:

- **Customize user profiles** in `convex/users.ts`
- **Add role-based permissions** to your Convex functions
- **Implement user settings** and preferences
- **Add additional OAuth providers** (GitHub, Discord, etc.)
- **Set up email verification** for password accounts

---

**Need help?** Check the [project README](../README.md) or create an issue in the repository.
