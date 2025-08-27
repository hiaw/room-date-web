<script lang="ts">
  import AppHeader from "./AppHeader.svelte";
</script>

<div class="min-h-screen bg-gray-50">
  <AppHeader />

  <main class="mx-auto max-w-4xl px-4 py-8">
    <!-- Placeholder for Room Dates content - to be implemented -->
    <div class="rounded-lg bg-white p-6 shadow-sm">
      <h2 class="mb-4 text-2xl font-bold text-gray-900">
        Welcome to Room Dates
      </h2>
      <p class="text-gray-600">
        Your mobile-first social event planning platform is being built! The
        schema has been designed and is ready for implementation.
      </p>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg border border-gray-200 p-4">
          <h3 class="font-semibold text-gray-900">🏠 Rooms</h3>
          <p class="text-sm text-gray-600">Create and manage your spaces</p>
        </div>

        <div class="rounded-lg border border-gray-200 p-4">
          <h3 class="font-semibold text-gray-900">🎉 Events</h3>
          <p class="text-sm text-gray-600">Host gatherings in your rooms</p>
        </div>

        <div class="rounded-lg border border-gray-200 p-4">
          <h3 class="font-semibold text-gray-900">🤝 Connections</h3>
          <p class="text-sm text-gray-600">Build meaningful relationships</p>
        </div>
      </div>
    </div>
  </main>
</div>
