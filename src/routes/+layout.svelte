<script lang="ts">
  import { PUBLIC_CONVEX_URL } from "$env/static/public";
  import { browser } from "$app/environment";
  import { setupConvex, useConvexClient } from "convex-svelte";
  import { onMount } from "svelte";
  import { setupConvexAuth } from "$lib/convex-auth.js";
  import AppLayout from "$lib/components/AppLayout.svelte";
  import "../app.css";

  const { children } = $props();

  // Setup Convex
  setupConvex(PUBLIC_CONVEX_URL);

  onMount(() => {
    // Validate OAuth state parameter on page load (CSRF protection)
    if (browser && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const receivedState = urlParams.get("state");
      const storedState = sessionStorage.getItem("oauth_state");
      if (receivedState && storedState) {
        if (receivedState !== storedState) {
          console.error(
            "OAuth state parameter mismatch - possible CSRF attack",
          );
          // Clear potentially compromised auth data
          sessionStorage.removeItem("oauth_state");
          sessionStorage.removeItem("oauth_verifier");
          // Redirect to home or show error
          window.location.href = "/?error=oauth_csrf";
          return;
        }
        // State is valid, clean up
        sessionStorage.removeItem("oauth_state");
      }
    }

    const convex = useConvexClient();
    setupConvexAuth(convex);
  });
</script>

<AppLayout>
  {@render children()}
</AppLayout>
