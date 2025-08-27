<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { api } from "../convex/_generated/api.js";
  import { type AuthTokens } from "./auth.js";
  import { authStore } from "./stores/auth.js";
  import AuthForm from "./components/auth/AuthForm.svelte";
  import Card from "./components/ui/Card.svelte";
  import Button from "./components/ui/Button.svelte";
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

<Card class="mx-auto mt-8 max-w-md p-8">
  <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">
    {isSignUp ? "Sign Up" : "Sign In"}
  </h2>

  {#if authError}
    <div class="mb-4">
      <ErrorMessage message={authError} dismissible onDismiss={clearError} />
    </div>
  {/if}

  <AuthForm
    onSubmit={handleAuthSubmit}
    {isSignUp}
    loading={isLoading}
    error={authError}
  />

  <p class="mt-4 text-center text-gray-600">
    {isSignUp ? "Already have an account?" : "Don't have an account?"}
    <Button
      variant="secondary"
      size="sm"
      onclick={toggleMode}
      class="ml-1 font-medium text-blue-600 underline hover:text-blue-800"
    >
      {isSignUp ? "Sign In" : "Sign Up"}
    </Button>
  </p>

  {#if !isSignUp}
    <p class="mt-2 text-center text-xs text-gray-500">
      New user? You'll need to create an account first.
    </p>
  {/if}
</Card>
