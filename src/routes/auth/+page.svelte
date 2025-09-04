<script lang="ts">
  import SimpleAuth from "$lib/SimpleAuth.svelte";
  import { Heart } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  let passwordResetCode = $state<string | undefined>(undefined);

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      passwordResetCode = code;
      // Clean up URL
      window.history.replaceState({}, document.title, "/auth");
    }
  });

  function handleBackToHome() {
    goto("/");
  }
</script>

<svelte:head>
  <title>Sign In - Room Dates</title>
  <meta
    name="description"
    content="Sign in to Room Dates to start hosting events or discovering amazing experiences in your area."
  />
</svelte:head>

<div
  class="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-12 sm:px-6 lg:px-8"
>
  <div class="w-full max-w-md space-y-8">
    <!-- Header -->
    <div class="text-center">
      <button
        onclick={handleBackToHome}
        class="mb-6 inline-flex items-center space-x-2 text-gray-600 transition-colors hover:text-purple-600"
      >
        <Heart class="h-8 w-8 fill-purple-600 text-purple-600" />
        <span
          class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent"
        >
          Room Dates
        </span>
      </button>

      <h1 class="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h1>
      <p class="text-gray-600">
        Sign in to your account or create a new one to get started
      </p>
    </div>

    <!-- Auth Form -->
    <div
      class="rounded-2xl border border-white/50 bg-white/90 p-8 shadow-xl backdrop-blur-md"
    >
      <SimpleAuth {passwordResetCode} />
    </div>

    <!-- Footer Links -->
    <div class="space-y-2 text-center">
      <button
        onclick={handleBackToHome}
        class="text-sm text-gray-500 transition-colors hover:text-purple-600"
      >
        ← Back to homepage
      </button>

      <div
        class="flex items-center justify-center space-x-4 text-xs text-gray-400"
      >
        <button onclick={() => goto("/privacy")} class="hover:text-gray-600"
          >Privacy</button
        >
        <span>•</span>
        <button onclick={() => goto("/terms")} class="hover:text-gray-600"
          >Terms</button
        >
        <span>•</span>
        <button onclick={() => goto("/faq")} class="hover:text-gray-600"
          >FAQ</button
        >
      </div>
    </div>
  </div>
</div>
