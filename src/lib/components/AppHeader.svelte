<script lang="ts">
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { useConvexClient } from "convex-svelte";
  import { authStore, userDisplayName } from "../stores/auth.js";
  import Button from "./ui/Button.svelte";
  import { loadApi } from "../convex/api.js";

  const convex = useConvexClient();

  // Import API only on client side
  let api: typeof import("../../convex/_generated/api.js").api | null = null;

  if (browser) {
    loadApi()
      .then((loadedApi) => {
        api = loadedApi;
      })
      .catch((error) => {
        console.error("Failed to load Convex API in AppHeader:", error);
      });
  }

  async function handleSignOut() {
    if (!api) {
      console.warn("API not ready for sign out");
      return;
    }

    try {
      // First clear local auth state immediately
      authStore.signOut();
      convex.setAuth(() => Promise.resolve(null));

      // Then try to sign out from server (best effort)
      await convex.action(api.auth.signOut, {});
    } catch (err) {
      console.warn("Sign out action failed:", err);
    }

    // Navigate to home page with sign out parameter using SvelteKit navigation
    await goto("/?signedOut=true", { invalidateAll: true });
  }
</script>

<header class="bg-white shadow">
  <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-6">
    <h1 class="text-2xl font-bold text-gray-900">Your Tasks</h1>
    <div class="flex items-center gap-4">
      <span class="text-sm text-gray-600"
        >Welcome back, {$userDisplayName}!</span
      >
      <Button variant="danger" onclick={handleSignOut}>Sign Out</Button>
    </div>
  </div>
</header>
