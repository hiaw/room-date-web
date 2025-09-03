<script lang="ts">
  import { onMount } from "svelte";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import ConnectionsWithNotes from "$lib/components/profile/ConnectionsWithNotes.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  function handleBack() {
    goto("/profile");
  }
</script>

<svelte:head>
  <title>My Connections - Room Dates</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
>
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center space-x-3">
        <Button variant="secondary" size="sm" onclick={handleBack} class="p-2">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Connections</h1>
          <p class="text-sm text-gray-600">
            Manage your connections with personal notes and tags
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6">
    <div class="mx-auto max-w-2xl">
      <ConnectionsWithNotes />
    </div>
  </div>
</div>
