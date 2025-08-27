<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  // Redirect authenticated users to the discover page
  onMount(() => {
    goto("/discover");
  });
</script>

<!-- This component just redirects - users shouldn't see this -->
<div class="flex min-h-screen items-center justify-center">
  <div class="text-center">
    <div
      class="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"
    ></div>
    <p class="mt-2 text-gray-600">Redirecting...</p>
  </div>
</div>
