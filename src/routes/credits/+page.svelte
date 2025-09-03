<script lang="ts">
  import CreditDashboard from "$lib/components/CreditDashboard.svelte";
</script>

<svelte:head>
  <title>Credits - Room Dates</title>
  <meta
    name="description"
    content="Manage your Room Dates credits and purchase more to connect with people at events."
  />
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
  <div class="mb-8">
    <h1 class="mb-2 text-3xl font-bold text-gray-900">Your Credits</h1>
    <p class="text-gray-600">
      Credits are used to create events and connect with people. You get 4 free
      credits when you join!
    </p>
  </div>

  <CreditDashboard />
</div>
