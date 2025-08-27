<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { authStore, userDisplayName } from "../stores/auth.js";
  import Button from "./ui/Button.svelte";

  const convex = useConvexClient();

  async function handleSignOut() {
    try {
      await convex.action(api.auth.signOut, {});
    } catch (err) {
      console.warn("Sign out action failed:", err);
    } finally {
      convex.setAuth(() => Promise.resolve(null));
      authStore.signOut();
    }
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
