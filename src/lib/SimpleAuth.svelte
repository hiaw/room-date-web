<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { api } from "../convex/_generated/api.js";
  import type { AuthTokens } from "./types/index.js";
  import { authStore } from "./stores/auth.js";
  import AuthForm from "./components/auth/AuthForm.svelte";
  import ErrorMessage from "./components/ui/ErrorMessage.svelte";

  const convex = useConvexClient();

  let isSignUp = false;
  let authError = "";

  async function handleAuthSubmit(
    email: string,
    password: string,
    name?: string,
  ) {
    authStore.setLoading(true);
    authError = "";

    try {
      // Attempt authentication first
      const result = await convex.action(api.auth.signIn, {
        provider: "password",
        params: isSignUp
          ? { email, password, name: name || email, flow: "signUp" }
          : { email, password, flow: "signIn" },
      });

      if (result && typeof result === "object" && "tokens" in result) {
        const authResult = result as { tokens: AuthTokens };

        // Set authentication on the Convex client
        convex.setAuth(() => Promise.resolve(authResult.tokens.token));

        // Log security event (rate limiting removed)
        await convex.mutation(api.securityLog.logSecurityEvent, {
          eventType: "auth_success",
          identifier: email,
          metadata: { flow: isSignUp ? "signUp" : "signIn" },
        });

        // Get user data
        const userData = await convex.query(api.users.getUserProfile, {});
        if (userData) {
          authStore.setAuthSuccess(userData, authResult.tokens);
        } else {
          // Fallback: minimal user object from email if profile fetch lags
          authStore.setAuthSuccess(
            { _id: "temp", email, name: name || email },
            authResult.tokens,
          );
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message.toLowerCase()
          : "authentication failed";

      // (Rate limiting removed) Always log failure generically
      // Log security event for failed auth
      await convex.mutation(api.securityLog.logSecurityEvent, {
        eventType: "auth_failure",
        identifier: email,
        metadata: {
          flow: isSignUp ? "signUp" : "signIn",
          error: errorMessage,
        },
      });

      // Use generic error messages to prevent user enumeration
      if (isSignUp) {
        // For sign-up, use generic message regardless of actual error
        authError =
          "If this email is not already registered, your account has been created. Please check your email for verification.";
      } else {
        // For sign-in, use generic message for all authentication failures
        authError =
          "Invalid email or password. Please check your credentials and try again.";
      }

      authStore.setAuthError(authError);
    }

    authStore.setLoading(false);
  }

  function toggleMode() {
    isSignUp = !isSignUp;
    authError = "";
  }

  function clearError() {
    authError = "";
  }

  // Subscribe to auth store for loading state
  $: ({ isLoading } = $authStore);
</script>

<div class="w-full">
  {#if authError}
    <div class="mb-6">
      <ErrorMessage message={authError} dismissible onDismiss={clearError} />
    </div>
  {/if}

  <AuthForm
    onSubmit={handleAuthSubmit}
    {isSignUp}
    loading={isLoading}
    error={authError}
  />

  <div class="mt-6 text-center">
    <p class="text-sm text-gray-600">
      {isSignUp ? "Already have an account?" : "Don't have an account?"}
    </p>
    <button
      onclick={toggleMode}
      class="mt-1 font-semibold text-purple-600 transition-colors hover:text-purple-700"
      disabled={isLoading}
    >
      {isSignUp ? "Sign In" : "Sign Up"}
    </button>
  </div>

  {#if !isSignUp}
    <p class="mt-4 text-center text-xs leading-relaxed text-gray-500">
      New to Room Dates? Create an account to start hosting events and
      connecting with people in your area.
    </p>
  {/if}
</div>
