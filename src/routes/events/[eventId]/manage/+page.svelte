<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EventOverview from "$lib/components/events/manage/EventOverview.svelte";
  import EventActions from "$lib/components/events/manage/EventActions.svelte";
  import EventStatistics from "$lib/components/events/manage/EventStatistics.svelte";
  import type {
    EventDetails,
    EventManagementActions,
    EventStats,
  } from "$lib/types/events.js";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  let eventId = $derived($page.params.eventId);
  let convex = useConvexClient();

  // Fetch event data
  let eventQuery = useQuery(api.events.getEvent, { eventId });
  let event = $derived(eventQuery?.data as EventDetails | null);
  let loading = $derived(eventQuery?.isLoading ?? true);

  // State
  let deleting = $state(false);

  // Navigation handlers
  function handleBack() {
    goto(`/events/${eventId}`);
  }

  function handleViewEvent() {
    goto(`/events/${eventId}`);
  }

  function handleEdit() {
    goto(`/events/${eventId}/edit`);
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    ) {
      return;
    }

    deleting = true;
    try {
      await convex.mutation(api.events.deleteEvent, { eventId });
      goto("/my-rooms");
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      deleting = false;
    }
  }

  // Create action handlers object
  let eventActions: EventManagementActions = $derived({
    onViewEvent: handleViewEvent,
    onEditEvent: handleEdit,
    onDeleteEvent: handleDelete,
  });

  // Create statistics object
  let statistics: EventStats = $derived({
    applicationCount: event?.applicationCount || 0,
    pendingApplicationCount: event?.pendingApplicationCount || 0,
  });
</script>

<svelte:head>
  <title>Manage Event - Room Dates</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <button
          onclick={handleBack}
          class="rounded-xl bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 class="text-xl font-bold text-gray-900">Manage Event</h1>
        <div class="w-10"></div>
        <!-- Spacer for centering -->
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else if !event}
    <div class="px-4 py-16 text-center">
      <h2 class="text-xl font-semibold text-gray-900">Event not found</h2>
      <p class="mt-2 text-gray-600">
        The event you're looking for doesn't exist or has been deleted.
      </p>
      <Button onclick={() => goto("/my-rooms")} class="mt-4">
        Back to My Rooms
      </Button>
    </div>
  {:else}
    <div class="mx-auto max-w-2xl px-4 py-6">
      <!-- Event Overview -->
      <EventOverview {event} />

      <!-- Management Actions and Statistics -->
      <div class="space-y-4">
        <EventActions actions={eventActions} isDeleting={deleting} />
        <EventStatistics {statistics} />
      </div>
    </div>
  {/if}
</div>
