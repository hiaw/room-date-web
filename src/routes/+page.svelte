<script lang="ts">
  import { onMount } from "svelte";
  import { replaceState, goto } from "$app/navigation";
  import { useConvexClient } from "convex-svelte";
  import { api } from "../convex/_generated/api.js";
  import { authStore, isAuthenticated } from "../lib/stores/auth.js";
  import AuthenticatedView from "../lib/components/AuthenticatedView.svelte";
  import UnauthenticatedView from "../lib/components/UnauthenticatedView.svelte";

  const convex = useConvexClient();

  onMount(async () => {
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      try {
        authStore.setLoading(true);

        // Get the verifier from sessionStorage (stored during OAuth initiation)
        const verifier = sessionStorage.getItem("oauth_verifier");

        if (verifier) {
          // Complete the OAuth flow
          const result = await convex.action(api.auth.signIn, {
            provider: "google",
            params: { code },
            verifier,
          });

          // Store the tokens if they exist
          if (result?.tokens) {
            authStore.setAuthSuccess(
              { _id: "", email: "", name: "" },
              result.tokens,
            );
          }

          // Clear the verifier and URL parameters
          sessionStorage.removeItem("oauth_verifier");
          replaceState("/", {});

          // Get user data after tokens are stored
          const userData = await convex.query(api.users.getUserProfile, {});
          if (userData) {
            authStore.setUser(userData);
            // After successful auth, redirect to discover page
            goto("/discover");
          }
        } else {
          authStore.setAuthError("OAuth verification failed");
        }
      } catch (err) {
        console.error("OAuth callback failed:", err);
        authStore.setAuthError("Sign-in failed");
        replaceState("/", {});
      } finally {
        authStore.setLoading(false);
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
  <UnauthenticatedView />
{/if}
