<script lang="ts">
  import { Calendar, MapPin, Users } from "lucide-svelte";
  import type { EventDetails } from "../../../types/events.js";
  import { formatDate, formatTime } from "../../../utils/date.js";

  interface Props {
    event: EventDetails;
  }

  let { event }: Props = $props();
</script>

<div
  class="mb-6 rounded-3xl border border-white/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
>
  <h2 class="mb-4 text-2xl font-bold text-gray-900">{event.title}</h2>

  <div class="space-y-3">
    <div class="flex items-center space-x-3 text-gray-600">
      <Calendar size={20} />
      <div>
        <p class="font-medium">{formatDate(event.startTime)}</p>
        <p class="text-sm">
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </p>
      </div>
    </div>

    {#if event.room?.location}
      <div class="flex items-start space-x-3 text-gray-600">
        <MapPin size={20} class="mt-0.5" />
        <p>{event.room.location}</p>
      </div>
    {/if}

    <div class="flex items-center space-x-3 text-gray-600">
      <Users size={20} />
      <p>{event.maxGuests} max guests</p>
    </div>

    {#if event.description}
      <div class="mt-4 rounded-lg bg-gray-50 p-4">
        <p class="text-gray-700">{event.description}</p>
      </div>
    {/if}
  </div>
</div>
