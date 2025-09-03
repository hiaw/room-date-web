<script lang="ts">
  import { onMount, tick } from "svelte";
  import { replaceState, goto } from "$app/navigation";
  import { useConvexClient } from "convex-svelte";
  import { api } from "../convex/_generated/api.js";
  import { authStore, isAuthenticated } from "../lib/stores/auth.js";
  import AuthenticatedView from "../lib/components/AuthenticatedView.svelte";
  import UnauthenticatedView from "../lib/components/UnauthenticatedView.svelte";

  const convex = useConvexClient();

  let passwordResetCode = $state<string | undefined>(undefined);

  /**
   * Safely clean up URL parameters after navigation is stable
   * Uses tick() to ensure DOM updates are complete before navigation changes
   */
  async function safeReplaceState(url: string): Promise<void> {
    await tick(); // Wait for any pending DOM updates
    replaceState(url, {});
  }

  onMount(async () => {
    // Handle OAuth callback and password reset codes
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    // Don't process OAuth callback if user just signed out
    if (urlParams.get("signedOut") === "true") {
      console.log("User signed out, cleaning up");
      authStore.setLoading(false);
      // Clean up URL
      await safeReplaceState("/");
      return;
    }

    if (code) {
      // Check if this is a password reset code or OAuth code
      const verifier = sessionStorage.getItem("oauth_verifier");

      if (verifier) {
        // This is an OAuth code - handle OAuth flow
        try {
          authStore.setLoading(true);

          // Complete the OAuth flow
          const result = await convex.action(api.auth.signIn, {
            provider: "google",
            params: { code },
            verifier,
          });

          // Store the tokens if they exist
          if (result?.tokens) {
            const tokens = result.tokens;

            // Update the Convex client with the new auth token to fetch the user
            convex.setAuth(() => Promise.resolve(tokens.token));

            // Clear the verifier and URL parameters before async operations
            sessionStorage.removeItem("oauth_verifier");

            // Clean up URL parameters after DOM updates are complete
            await safeReplaceState("/");

            // Get user data and then update the store
            const userData = await convex.query(api.users.getUserProfile, {});
            if (userData) {
              authStore.setAuthSuccess(userData, tokens);
              // After successful auth, redirect to discover page
              goto("/discover");
            } else {
              // This is an error state, we have tokens but no user.
              authStore.setAuthError(
                "Failed to retrieve user profile after login.",
              );
            }
          } else {
            console.error("OAuth callback result:", result);
            authStore.setAuthError("No tokens received from OAuth");
          }
        } catch (err) {
          console.error("OAuth callback failed:", err);
          authStore.setAuthError("Sign-in failed");
          // Clean up URL on error
          await safeReplaceState("/");
        } finally {
          authStore.setLoading(false);
        }
      } else {
        // This is likely a password reset code - set it for the UI
        passwordResetCode = code;
        // Clean up the URL but keep the password reset code in state
        await safeReplaceState("/");
      }
    } else {
      // Normal page load - check for existing auth
      const hasToken = authStore.checkExistingAuth();
      if (hasToken) {
        try {
          // Add timeout to prevent indefinite loading
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Auth timeout")), 10000),
          );

          const userDataPromise = convex.query(api.users.getUserProfile, {});
          const userData = (await Promise.race([
            userDataPromise,
            timeoutPromise,
          ])) as { _id?: string } | null;

          if (userData && userData._id) {
            authStore.setUser(
              userData as { _id: string; email?: string; name?: string },
            );
            // If already authenticated, redirect to discover
            goto("/discover");
          } else {
            authStore.signOut();
          }
        } catch (err) {
          console.error("Failed to get user data:", err);
          authStore.signOut();
        }
      } else {
        authStore.setLoading(false);
      }
    }
  });
</script>

{#if $isAuthenticated}
  <AuthenticatedView />
{:else}
  <UnauthenticatedView {passwordResetCode} />
{/if}
