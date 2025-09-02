<script lang="ts">
  import RoomCard from "./RoomCard.svelte";
  import type { Room } from "$lib/types/domains/rooms.js";
  import type { EventWithDetails } from "$lib/types/domains/events.js";

  interface Props {
    rooms: Room[];
    eventsByRoom: Record<string, EventWithDetails[]>;
    onEditRoom: (roomId: string) => void;
    onCreateEvent: (roomId: string) => void;
    onViewEvent: (eventId: string) => void;
  }

  let { rooms, eventsByRoom, onEditRoom, onCreateEvent, onViewEvent }: Props =
    $props();
</script>

{#if rooms.length > 0}
  <div>
    <h2 class="mb-4 text-lg font-semibold text-gray-900">My Rooms</h2>
    <!-- Rooms List -->
    <div class="space-y-6">
      {#each rooms as room (room._id)}
        <RoomCard
          {room}
          events={eventsByRoom[room._id] || []}
          {onEditRoom}
          {onCreateEvent}
          {onViewEvent}
        />
      {/each}
    </div>
  </div>
{/if}
