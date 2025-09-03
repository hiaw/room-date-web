<script lang="ts">
  import { onMount } from "svelte";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    } else {
      // Redirect to profile where connections are now managed
      goto("/profile");
    }
  });
</script>

<svelte:head>
  <title>Redirecting... - Room Dates</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <div class="flex items-center justify-center py-16">
    <div class="text-center">
      <p class="text-gray-600">Redirecting to Profile...</p>
    </div>
  </div>
</div>
