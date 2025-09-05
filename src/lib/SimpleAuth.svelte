<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { api } from "../convex/_generated/api.js";
  import { goto } from "$app/navigation";
  import type { AuthTokens } from "./types/index.js";
  import { authStore } from "./stores/auth.js";
  import AuthForm from "./components/auth/AuthForm.svelte";
  import ForgotPasswordForm from "./components/auth/ForgotPasswordForm.svelte";
  import PasswordResetCompleteForm from "./components/auth/PasswordResetCompleteForm.svelte";
  import ErrorMessage from "./components/ui/ErrorMessage.svelte";

  interface Props {
    passwordResetCode?: string;
  }

  let { passwordResetCode }: Props = $props();

  const convex = useConvexClient();

  let isSignUp = $state(false);
  let showForgotPassword = $state(false);
  let authError = $state("");
  let forgotPasswordError = $state("");
  let forgotPasswordSuccess = $state(false);
  let passwordResetError = $state("");
  let passwordResetSuccess = $state(false);

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
        // Redirect to discover page after successful authentication
        goto("/discover");
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

  async function handlePasswordResetComplete(
    email: string,
    newPassword: string,
  ) {
    authStore.setLoading(true);
    passwordResetError = "";

    try {
      // Use the correct password reset verification flow with email
      const result = await convex.action(api.auth.signIn, {
        provider: "password",
        params: {
          email: email,
          code: passwordResetCode,
          newPassword: newPassword,
          flow: "reset-verification",
        },
      });

      if (result && typeof result === "object" && "tokens" in result) {
        const authResult = result as { tokens: AuthTokens };

        // Set authentication on the Convex client
        convex.setAuth(() => Promise.resolve(authResult.tokens.token));

        // Get user data and update the store
        const userData = await convex.query(api.users.getUserProfile, {});
        if (userData) {
          authStore.setAuthSuccess(userData, authResult.tokens);
          // Redirect to discover page after successful password reset
          goto("/discover");
        }
      }

      passwordResetSuccess = true;
    } catch (err) {
      console.error("Password reset error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reset password";
      passwordResetError = errorMessage;
    } finally {
      authStore.setLoading(false);
    }
  }

  function hidePasswordResetComplete() {
    passwordResetError = "";
    passwordResetSuccess = false;
    // Navigate back to normal auth flow using SvelteKit navigation
    goto("/", { replaceState: true });
  }

  async function handleForgotPassword(email: string) {
    authStore.setLoading(true);
    forgotPasswordError = "";

    try {
      // Use the Convex Auth signIn action with password reset flow
      await convex.action(api.auth.signIn, {
        provider: "password",
        params: {
          email,
          flow: "reset",
        },
      });

      forgotPasswordSuccess = true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send reset email";
      forgotPasswordError = errorMessage;
    } finally {
      authStore.setLoading(false);
    }
  }

  function showForgotPasswordForm() {
    showForgotPassword = true;
    authError = "";
    forgotPasswordError = "";
    forgotPasswordSuccess = false;
  }

  function hideForgotPasswordForm() {
    showForgotPassword = false;
    forgotPasswordError = "";
    forgotPasswordSuccess = false;
  }

  function toggleMode() {
    isSignUp = !isSignUp;
    authError = "";
    showForgotPassword = false;
    forgotPasswordError = "";
    forgotPasswordSuccess = false;
  }

  function clearError() {
    authError = "";
  }

  // Subscribe to auth store for loading state
  const isLoading = $derived($authStore.isLoading);
</script>

<div class="w-full">
  {#if authError}
    <div class="mb-6">
      <ErrorMessage message={authError} dismissible onDismiss={clearError} />
    </div>
  {/if}

  {#if passwordResetCode}
    <!-- Password Reset Completion Flow -->
    <PasswordResetCompleteForm
      onSubmit={handlePasswordResetComplete}
      onCancel={hidePasswordResetComplete}
      loading={isLoading}
      error={passwordResetError}
      success={passwordResetSuccess}
    />
  {:else if showForgotPassword}
    <!-- Forgot Password Flow -->
    <ForgotPasswordForm
      onSubmit={handleForgotPassword}
      onBack={hideForgotPasswordForm}
      loading={isLoading}
      error={forgotPasswordError}
      success={forgotPasswordSuccess}
    />
  {:else}
    <!-- Normal Auth Flow -->
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
      <div class="mt-4 text-center">
        <button
          onclick={showForgotPasswordForm}
          class="text-sm text-purple-600 transition-colors hover:text-purple-700 hover:underline"
          disabled={isLoading}
        >
          Forgot your password?
        </button>
      </div>

      <p class="mt-4 text-center text-xs leading-relaxed text-gray-500">
        New to Room Dates? Create an account to start hosting events and
        connecting with people in your area.
      </p>
    {/if}
  {/if}
</div>
