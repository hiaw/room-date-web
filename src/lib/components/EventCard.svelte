<script lang="ts">
  import { goto } from "$app/navigation";
  import { MapPin, Clock, Users, Calendar, Heart } from "lucide-svelte";
  import { formatDistanceToNow, format } from "date-fns";

  interface EventData {
    _id: string;
    title?: string;
    description?: string;
    suggestedTimes?: Date[];
    isFlexibleTiming?: boolean;
    maxGuests?: number;
    preferredGender?: string[];
    minAge?: number;
    maxAge?: number;
    roomTitle?: string;
    roomDescription?: string;
    roomCity?: string;
    roomState?: string;
    hostName?: string;
    hostAge?: number;
    distanceMiles?: number;
    applicantCount?: number;
    _creationTime: number;
  }

  interface Props {
    event: EventData;
  }

  let { event }: Props = $props();

  let bookmarked = $state(false);

  function handleEventClick() {
    goto(`/events/${event._id}`);
  }

  function toggleBookmark(e: Event) {
    e.stopPropagation();
    bookmarked = !bookmarked;
    // TODO: Implement bookmark functionality with Convex
  }

  function getEventTimeDisplay(): string {
    if (event.isFlexibleTiming) {
      return "Flexible timing";
    }

    if (event.suggestedTimes && event.suggestedTimes.length > 0) {
      const firstTime = event.suggestedTimes[0];
      return format(firstTime, "MMM d, h:mm a");
    }

    return "Time TBD";
  }

  function getGuestCountDisplay(): string {
    const current = event.applicantCount || 0;
    const max = event.maxGuests;

    if (max) {
      return `${current}/${max} guests`;
    }
    return `${current} interested`;
  }

  function getAgeRangeDisplay(): string {
    if (event.minAge && event.maxAge) {
      return `${event.minAge}-${event.maxAge}`;
    } else if (event.minAge) {
      return `${event.minAge}+`;
    } else if (event.maxAge) {
      return `Under ${event.maxAge}`;
    }
    return "";
  }

  function getLocationDisplay(): string {
    const parts = [];
    if (event.roomCity) parts.push(event.roomCity);
    if (event.roomState) parts.push(event.roomState);
    return parts.join(", ");
  }

  let timeAgo = $derived(
    formatDistanceToNow(new Date(event._creationTime), {
      addSuffix: true,
    }),
  );
  let ageRange = $derived(getAgeRangeDisplay());
  let location = $derived(getLocationDisplay());
</script>

<div
  class="cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
  onclick={handleEventClick}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === "Enter" && handleEventClick()}
>
  <!-- Header -->
  <div class="p-4 pb-3">
    <div class="mb-2 flex items-start justify-between">
      <div class="flex-1">
        <h3 class="line-clamp-1 text-lg font-semibold text-gray-900">
          {event.title || "Untitled Event"}
        </h3>
        <p class="text-sm font-medium text-purple-600">
          in {event.roomTitle || "Room"}
        </p>
      </div>

      <button
        onclick={toggleBookmark}
        class="rounded-full p-2 transition-colors hover:bg-gray-50 {bookmarked
          ? 'text-red-500'
          : 'text-gray-400'}"
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark event"}
      >
        <Heart size={18} class={bookmarked ? "fill-current" : ""} />
      </button>
    </div>

    {#if event.description}
      <p class="mb-3 line-clamp-2 text-sm text-gray-600">
        {event.description}
      </p>
    {/if}
  </div>

  <!-- Event Details -->
  <div class="px-4 pb-4">
    <div class="grid grid-cols-2 gap-3 text-sm">
      <!-- Time -->
      <div class="flex items-center space-x-2 text-gray-600">
        <Clock size={14} class="flex-shrink-0" />
        <span class="truncate">{getEventTimeDisplay()}</span>
      </div>

      <!-- Location -->
      {#if location}
        <div class="flex items-center space-x-2 text-gray-600">
          <MapPin size={14} class="flex-shrink-0" />
          <span class="truncate">{location}</span>
        </div>
      {/if}

      <!-- Guests -->
      <div class="flex items-center space-x-2 text-gray-600">
        <Users size={14} class="flex-shrink-0" />
        <span class="truncate">{getGuestCountDisplay()}</span>
      </div>

      <!-- Distance -->
      {#if event.distanceMiles}
        <div class="flex items-center space-x-2 text-gray-600">
          <MapPin size={14} class="flex-shrink-0" />
          <span class="truncate">{event.distanceMiles.toFixed(1)}mi away</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Host & Preferences -->
  <div class="border-t border-gray-50 px-4 pt-3 pb-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <!-- Host Avatar -->
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
        >
          <span class="text-sm font-medium text-white">
            {event.hostName?.charAt(0) || "?"}
          </span>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">
            {event.hostName || "Anonymous Host"}
            {#if event.hostAge}
              <span class="text-gray-500">• {event.hostAge}</span>
            {/if}
          </p>
          <p class="text-xs text-gray-500">{timeAgo}</p>
        </div>
      </div>

      <!-- Tags -->
      <div class="flex items-center space-x-2">
        {#if ageRange}
          <span class="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600">
            {ageRange}
          </span>
        {/if}

        {#if event.preferredGender && event.preferredGender.length > 0}
          <span
            class="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600"
          >
            {event.preferredGender.join(", ")}
          </span>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
