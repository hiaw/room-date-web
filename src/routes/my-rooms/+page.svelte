<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import RoomsHeader from "$lib/components/rooms/RoomsHeader.svelte";
  import ApplicationsList from "$lib/components/rooms/ApplicationsList.svelte";
  import RoomsList from "$lib/components/rooms/RoomsList.svelte";
  import RoomsEmptyState from "$lib/components/rooms/RoomsEmptyState.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Reactive queries - TODO: Consider using composite query for better performance
  let roomsQueryResult = useQuery(api.rooms.getMyRooms, {});
  let eventsQueryResult = useQuery(api.events.getUserEvents, {});
  let applicationsQueryResult = useQuery(
    api.eventApplications.getMyApplications,
    {},
  );

  // Extract data
  let rooms = $derived(roomsQueryResult?.data ?? []);
  let events = $derived(eventsQueryResult?.data ?? []);
  let applications = $derived(applicationsQueryResult?.data ?? []);

  let loading = $derived(
    roomsQueryResult?.isLoading ||
      eventsQueryResult?.isLoading ||
      applicationsQueryResult?.isLoading,
  );

  // Group events by room
  let eventsByRoom = $derived(
    events.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: Record<string, any[]>, event: any) => {
        const roomId = event.roomId;
        if (!acc[roomId]) acc[roomId] = [];
        acc[roomId].push(event);
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as Record<string, any[]>,
    ),
  );

  function createRoom() {
    goto("/rooms/create");
  }

  function editRoom(roomId: string) {
    goto(`/rooms/${roomId}/edit`);
  }

  function createEvent(roomId: string) {
    goto(`/rooms/${roomId}/events/create`);
  }

  function viewEvent(eventId: string) {
    goto(`/events/${eventId}`);
  }
</script>

<svelte:head>
  <title>My Rooms - Room Dates</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
>
  <!-- Header -->
  <RoomsHeader onCreateRoom={createRoom} />

  <!-- Content -->
  <div class="px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="space-y-8">
        <!-- Applied Events Section -->
        <ApplicationsList {applications} onViewEvent={viewEvent} />

        <!-- My Rooms Section -->
        {#if rooms.length === 0 && (!applications || applications.length === 0)}
          <!-- Empty State -->
          <RoomsEmptyState onCreateRoom={createRoom} />
        {:else}
          <RoomsList
            {rooms}
            {eventsByRoom}
            onEditRoom={editRoom}
            onCreateEvent={createEvent}
            onViewEvent={viewEvent}
          />
        {/if}
      </div>
    {/if}
  </div>
</div>
