<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { loadApi } from "../../convex/api.js";
  import { authStore } from "../../stores/auth.js";
  import Button from "../ui/Button.svelte";
  import { browser } from "$app/environment";

  interface Props {
    provider: "google";
    disabled?: boolean;
  }

  let { provider, disabled = false }: Props = $props();

  const convex = useConvexClient();

  // Import API only on client side
  let api: any = null;

  if (browser) {
    loadApi()
      .then((loadedApi) => {
        api = loadedApi;
      })
      .catch((error) => {
        console.error("Failed to load Convex API in OAuthButton:", error);
      });
  }

  const providerConfig = {
    google: {
      name: "Google",
      icon: "🔵",
      color: "bg-white border-gray-300 text-gray-700 hover:bg-gray-50",
    },
  };

  const config = providerConfig[provider];

  async function handleOAuthSignIn() {
    if (!api) {
      console.warn("API not ready for OAuth sign-in");
      authStore.setAuthError("API not ready");
      return;
    }

    try {
      authStore.setLoading(true);

      // Generate cryptographically secure state parameter for CSRF protection
      const state = browser ? crypto.randomUUID() : Math.random().toString(36);

      // Store state in sessionStorage for verification on callback
      if (browser) {
        sessionStorage.setItem("oauth_state", state);
      }

      // Get the OAuth redirect URL from Convex
      const result = await convex.action(api.auth.signIn, { provider });

      // Store the verifier for use in the callback (now using sessionStorage)
      if (result?.verifier && browser) {
        sessionStorage.setItem("oauth_verifier", result.verifier);
      }

      // Redirect to the OAuth provider
      if (result?.redirect) {
        window.location.href = result.redirect;
      } else {
        console.warn("OAuth sign-in did not return a redirect URL");
        authStore.setAuthError("OAuth sign-in failed to start");
        authStore.setLoading(false);
      }
    } catch (err) {
      console.error(`${config.name} sign-in failed:`, err);
      authStore.setAuthError(`Failed to sign in with ${config.name}`);
      authStore.setLoading(false);
    }
  }

  // Use $derived for Svelte 5 runes mode
  const isLoading = $derived($authStore.isLoading);
</script>

<Button
  variant="secondary"
  onclick={handleOAuthSignIn}
  disabled={disabled || isLoading}
  loading={isLoading}
  class="w-full border {config.color}"
>
  <div class="flex items-center justify-center gap-2">
    <span class="text-lg">{config.icon}</span>
    Continue with {config.name}
  </div>
</Button>
