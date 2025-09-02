<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import {
    Plus,
    MapPin,
    Calendar,
    Users,
    Home,
    Edit3,
    Settings,
  } from "lucide-svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Reactive queries
  let roomsQueryResult = useQuery(api.rooms.getMyRooms, {});
  let eventsQueryResult = useQuery(api.events.getUserEvents, {});
  let applicationsQueryResult = useQuery(
    api.eventApplications.getMyApplications,
    {},
  );

  let rooms = $derived(roomsQueryResult.data ?? []);
  let events = $derived(eventsQueryResult.data ?? []);
  let applications = $derived(applicationsQueryResult.data ?? []);
  let loading = $derived(
    roomsQueryResult.isLoading ||
      eventsQueryResult.isLoading ||
      applicationsQueryResult.isLoading,
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

  function getEventCountText(count: number): string {
    if (count === 0) return "No events";
    if (count === 1) return "1 event";
    return `${count} events`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getLocationDisplay(room: any): string {
    const parts = [];
    if (room.city) parts.push(room.city);
    if (room.state) parts.push(room.state);
    return parts.join(", ") || "Location not set";
  }

  function formatApplicationDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  }
</script>

<svelte:head>
  <title>My Rooms - Room Dates</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
>
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Rooms</h1>
          <p class="text-sm text-gray-600">Manage your spaces and events</p>
        </div>
        <button
          onclick={createRoom}
          class="inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
        >
          <Plus size={18} />
          <span class="hidden sm:inline">New Room</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else}
      <div class="space-y-8">
        <!-- Applied Events Section -->
        {#if applications && applications.length > 0}
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900">
              Applied Events
            </h2>
            <div class="space-y-3">
              {#each applications as application (application._id)}
                <div
                  class="cursor-pointer overflow-hidden rounded-xl border border-white/50 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
                  onclick={() => viewEvent(application.eventId)}
                  onkeydown={(e) =>
                    e.key === "Enter" || e.key === " "
                      ? viewEvent(application.eventId)
                      : null}
                  role="button"
                  tabindex="0"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900">
                        {application.event.title || "Untitled Event"}
                      </h3>
                      <p class="mt-1 text-sm text-gray-600">
                        {application.event.roomTitle} • Applied {formatApplicationDate(
                          application._creationTime,
                        )}
                      </p>
                      {#if application.message}
                        <p class="mt-2 line-clamp-2 text-sm text-gray-500">
                          "{application.message}"
                        </p>
                      {/if}
                    </div>
                    <div class="ml-4 flex flex-col items-end space-y-2">
                      <span
                        class="rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
                          application.status,
                        )}"
                      >
                        {getStatusText(application.status)}
                      </span>
                      {#if application.event.startTime}
                        <span class="text-xs text-gray-500">
                          {new Date(
                            application.event.startTime,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      {:else if application.event.isFlexibleTiming}
                        <span class="text-xs text-gray-500"
                          >Flexible timing</span
                        >
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- My Rooms Section -->
        {#if rooms.length === 0 && (!applications || applications.length === 0)}
          <!-- Empty State -->
          <div class="py-16 text-center">
            <div
              class="mx-auto max-w-md rounded-3xl border border-white/50 bg-white/70 p-12 backdrop-blur-sm"
            >
              <Home class="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 class="mb-2 text-xl font-semibold text-gray-900">
                Create Your First Room
              </h3>
              <p class="mb-8 text-gray-600">
                Rooms are your personal spaces where you can host events and
                connect with people who share your interests.
              </p>
              <button
                onclick={createRoom}
                class="inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
              >
                <Plus size={20} />
                <span>Create Room</span>
              </button>
            </div>
          </div>
        {:else if rooms.length > 0}
          <div>
            <h2 class="mb-4 text-lg font-semibold text-gray-900">My Rooms</h2>
            <!-- Rooms List -->
            <div class="space-y-6">
              {#each rooms as room (room._id)}
                <div
                  class="overflow-hidden rounded-2xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
                >
                  <!-- Room Header -->
                  <div class="border-b border-gray-100 p-6">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h3 class="mb-2 text-xl font-semibold text-gray-900">
                          {room.title}
                        </h3>
                        {#if room.description}
                          <p class="mb-3 line-clamp-2 text-gray-600">
                            {room.description}
                          </p>
                        {/if}
                        <div
                          class="flex items-center space-x-4 text-sm text-gray-500"
                        >
                          <div class="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>{getLocationDisplay(room)}</span>
                          </div>
                          <div class="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span
                              >{getEventCountText(
                                eventsByRoom[room._id]?.length || 0,
                              )}</span
                            >
                          </div>
                        </div>
                      </div>

                      <!-- Room Actions -->
                      <div class="ml-4 flex items-center space-x-2">
                        <button
                          onclick={() => createEvent(room._id)}
                          class="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"
                          title="Create Event"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          onclick={() => editRoom(room._id)}
                          class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50"
                          title="Edit Room"
                        >
                          <Edit3 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Room Events -->
                  {#if eventsByRoom[room._id] && eventsByRoom[room._id].length > 0}
                    <div class="p-6 pt-4">
                      <div class="mb-4 flex items-center justify-between">
                        <h4 class="font-medium text-gray-900">Recent Events</h4>
                        <button
                          onclick={() => createEvent(room._id)}
                          class="text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                          + Add Event
                        </button>
                      </div>

                      <div class="space-y-3">
                        {#each eventsByRoom[room._id].slice(0, 3) as event (event._id)}
                          <div
                            class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                            onclick={() => viewEvent(event._id)}
                            onkeydown={(e) =>
                              e.key === "Enter" || e.key === " "
                                ? viewEvent(event._id)
                                : null}
                            role="button"
                            tabindex="0"
                          >
                            <div class="flex-1">
                              <p class="font-medium text-gray-900">
                                {event.title || "Untitled Event"}
                              </p>
                              <div
                                class="mt-1 flex items-center space-x-3 text-sm text-gray-500"
                              >
                                {#if event.isFlexibleTiming}
                                  <span>Flexible timing</span>
                                {:else if event.suggestedTimes && event.suggestedTimes[0]}
                                  <span
                                    >{new Date(
                                      event.suggestedTimes[0],
                                    ).toLocaleDateString()}</span
                                  >
                                {/if}
                                {#if event.applicantCount !== undefined}
                                  <span class="flex items-center space-x-1">
                                    <Users size={12} />
                                    <span
                                      >{event.applicantCount} interested</span
                                    >
                                  </span>
                                {/if}
                              </div>
                            </div>

                            <div class="flex items-center space-x-2">
                              {#if event.applicantCount && event.applicantCount > 0}
                                <span
                                  class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                                >
                                  {event.applicantCount} pending
                                </span>
                              {/if}
                              <button
                                class="p-1 text-gray-400 hover:text-gray-600"
                                onclick={(e) => {
                                  e.stopPropagation();
                                  goto(`/events/${event._id}/manage`);
                                }}
                              >
                                <Settings size={14} />
                              </button>
                            </div>
                          </div>
                        {/each}
                      </div>

                      {#if eventsByRoom[room._id].length > 3}
                        <button
                          onclick={() => goto(`/rooms/${room._id}/events`)}
                          class="mt-3 w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                        >
                          View all {eventsByRoom[room._id].length} events →
                        </button>
                      {/if}
                    </div>
                  {:else}
                    <!-- No Events in Room -->
                    <div class="p-6 pt-4 text-center">
                      <Calendar class="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p class="mb-3 text-sm text-gray-500">
                        No events in this room yet
                      </p>
                      <button
                        onclick={() => createEvent(room._id)}
                        class="inline-flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
                      >
                        <Plus size={16} />
                        <span>Create First Event</span>
                      </button>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    display: block;
    line-clamp: 2;
  }
</style>
