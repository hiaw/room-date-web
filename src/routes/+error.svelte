<script lang="ts">
  import { goto } from "$app/navigation";
  import { Home, ArrowLeft, Search } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";

  function handleGoHome() {
    goto("/");
  }

  function handleGoBack() {
    window.history.back();
  }

  function handleBrowseEvents() {
    goto("/discover");
  }
</script>

<svelte:head>
  <title>Page Not Found - Room Dates</title>
  <meta
    name="description"
    content="The page you're looking for doesn't exist."
  />
</svelte:head>

<div
  class="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4"
>
  <div class="max-w-md text-center">
    <!-- Large 404 -->
    <div class="mb-8">
      <h1 class="mb-2 text-8xl font-bold text-purple-600">404</h1>
      <div class="mx-auto h-1 w-20 rounded bg-purple-600"></div>
    </div>

    <!-- Error Message -->
    <h2 class="mb-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
    <p class="mb-8 leading-relaxed text-gray-600">
      Oops! The page you're looking for seems to have vanished into thin air.
      Don't worry though, we've got plenty of other great places to explore.
    </p>

    <!-- Action Buttons -->
    <div class="space-y-3">
      <Button onclick={handleGoHome} class="w-full">
        <Home size={16} class="mr-2" />
        Go Home
      </Button>

      <div class="grid grid-cols-2 gap-3">
        <Button onclick={handleGoBack} variant="secondary" class="w-full">
          <ArrowLeft size={16} class="mr-2" />
          Go Back
        </Button>

        <Button onclick={handleBrowseEvents} variant="secondary" class="w-full">
          <Search size={16} class="mr-2" />
          Browse Events
        </Button>
      </div>
    </div>

    <!-- Helpful Links -->
    <div class="mt-12 border-t border-gray-200 pt-8">
      <p class="mb-4 text-sm text-gray-500">Popular pages:</p>
      <div class="flex flex-wrap justify-center gap-4 text-sm">
        <a
          href="/discover"
          class="text-purple-600 transition-colors hover:text-purple-700"
        >
          Discover Events
        </a>
        <a
          href="/my-rooms"
          class="text-purple-600 transition-colors hover:text-purple-700"
        >
          My Rooms
        </a>
        <a
          href="/profile"
          class="text-purple-600 transition-colors hover:text-purple-700"
        >
          Profile
        </a>
        <a
          href="/messages"
          class="text-purple-600 transition-colors hover:text-purple-700"
        >
          Messages
        </a>
      </div>
    </div>
  </div>
</div>
