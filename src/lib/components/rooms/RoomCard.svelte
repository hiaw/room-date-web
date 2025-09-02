<script lang="ts">
  import {
    MapPin,
    Calendar,
    Users,
    Plus,
    Edit3,
    Settings,
  } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import type { Room } from "$lib/types/domains/rooms.js";
  import type { EventWithDetails } from "$lib/types/domains/events.js";

  interface Props {
    room: Room;
    events: EventWithDetails[];
    onEditRoom: (roomId: string) => void;
    onCreateEvent: (roomId: string) => void;
    onViewEvent: (eventId: string) => void;
  }

  let { room, events, onEditRoom, onCreateEvent, onViewEvent }: Props =
    $props();

  function getEventCountText(count: number): string {
    if (count === 0) return "No events";
    if (count === 1) return "1 event";
    return `${count} events`;
  }

  function getLocationDisplay(room: Room): string {
    const parts = [];
    if (room.city) parts.push(room.city);
    if (room.state) parts.push(room.state);
    return parts.join(", ") || "Location not set";
  }
</script>

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
        <div class="flex items-center space-x-4 text-sm text-gray-500">
          <div class="flex items-center space-x-1">
            <MapPin size={14} />
            <span>{getLocationDisplay(room)}</span>
          </div>
          <div class="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{getEventCountText(events?.length || 0)}</span>
          </div>
        </div>
      </div>

      <!-- Room Actions -->
      <div class="ml-4 flex items-center space-x-2">
        <button
          onclick={() => onCreateEvent(room._id)}
          class="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"
          title="Create Event"
        >
          <Plus size={18} />
        </button>
        <button
          onclick={() => onEditRoom(room._id)}
          class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50"
          title="Edit Room"
        >
          <Edit3 size={18} />
        </button>
      </div>
    </div>
  </div>

  <!-- Room Events -->
  {#if events && events.length > 0}
    <div class="p-6 pt-4">
      <div class="mb-4 flex items-center justify-between">
        <h4 class="font-medium text-gray-900">Recent Events</h4>
        <button
          onclick={() => onCreateEvent(room._id)}
          class="text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          + Add Event
        </button>
      </div>

      <div class="space-y-3">
        {#each events.slice(0, 3) as event (event._id)}
          <div
            class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            onclick={() => onViewEvent(event._id)}
            onkeydown={(e) =>
              e.key === "Enter" || e.key === " "
                ? onViewEvent(event._id)
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
                {:else if event.suggestedTimeSlots && event.suggestedTimeSlots[0]}
                  <span
                    >{new Date(
                      event.suggestedTimeSlots[0].startTime,
                    ).toLocaleDateString()}</span
                  >
                {/if}
                {#if event.applicationCount !== undefined}
                  <span class="flex items-center space-x-1">
                    <Users size={12} />
                    <span>{event.applicationCount} interested</span>
                  </span>
                {/if}
                {#if event.applicationCount !== undefined}
                  <span class="flex items-center space-x-1">
                    <Users size={12} />
                    <span>{event.applicationCount} interested</span>
                  </span>
                {/if}
              </div>
            </div>

            <div class="flex items-center space-x-2">
              {#if event.applicationCount && event.applicationCount > 0}
                <span
                  class="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                >
                  {event.applicationCount} pending
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

      {#if events.length > 3}
        <button
          onclick={() => goto(`/rooms/${room._id}/events`)}
          class="mt-3 w-full py-2 text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          View all {events.length} events →
        </button>
      {/if}
    </div>
  {:else}
    <!-- No Events in Room -->
    <div class="p-6 pt-4 text-center">
      <Calendar class="mx-auto mb-2 h-8 w-8 text-gray-400" />
      <p class="mb-3 text-sm text-gray-500">No events in this room yet</p>
      <button
        onclick={() => onCreateEvent(room._id)}
        class="inline-flex items-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-sm text-white transition-colors hover:bg-purple-700"
      >
        <Plus size={16} />
        <span>Create First Event</span>
      </button>
    </div>
  {/if}
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
