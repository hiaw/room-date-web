<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { authStore, isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import {
    Search,
    MapPin,
    Clock,
    Users,
    Calendar,
    Filter,
    Plus,
  } from "lucide-svelte";
  import EventCard from "$lib/components/EventCard.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  const convex = useConvexClient();

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Search and filter state
  let searchQuery = $state("");
  let showFilters = $state(false);
  let selectedGenders: string[] = $state([]);
  let ageRange = $state({ min: 18, max: 65 });
  let maxDistance = $state(25);

  // Reactive query
  let eventsQueryResult = useQuery(api.events.getEventsNearUser, {
    latitude: 37.7749, // TODO: Get user's actual location
    longitude: -122.4194,
    radiusMiles: maxDistance,
    limit: 20,
  });

  let events = $derived(eventsQueryResult.data ?? []);
  let loading = $derived(eventsQueryResult.isLoading);

  function handleSearch(query: string) {
    searchQuery = query.toLowerCase();
  }

  function toggleFilter() {
    showFilters = !showFilters;
  }

  // Filter events based on search and filters
  let filteredEvents = $derived(
    events.filter((event: any) => {
      if (!event) return false;

      // Search filter
      if (searchQuery) {
        const searchableText = [
          event.title,
          event.description,
          event.roomTitle,
          event.roomDescription,
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchQuery)) return false;
      }

      // Gender filter
      if (selectedGenders.length > 0 && event.preferredGender) {
        const hasMatchingGender = selectedGenders.some((gender) =>
          event.preferredGender?.includes(gender),
        );
        if (!hasMatchingGender) return false;
      }

      // Age filter (if event specifies age requirements)
      if (event.minAge && ageRange.max < event.minAge) return false;
      if (event.maxAge && ageRange.min > event.maxAge) return false;

      return true;
    }),
  );
</script>

<svelte:head>
  <title>Discover Events - Room Dates</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
>
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Discover</h1>
          <p class="text-sm text-gray-600">Find amazing events near you</p>
        </div>
        <button
          onclick={toggleFilter}
          class="rounded-xl bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200"
          aria-label="Filters"
        >
          <Filter size={20} />
        </button>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <Search
          class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
        />
        <input
          type="text"
          placeholder="Search events, rooms, or activities..."
          class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
          bind:value={searchQuery}
          oninput={(e) => {
            const target = e.target as HTMLInputElement;
            handleSearch(target.value);
          }}
        />
      </div>

      <!-- Filter Panel -->
      {#if showFilters}
        <div class="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div class="space-y-4">
            <!-- Distance Filter -->
            <div>
              <label
                for="distance-slider"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Distance: {maxDistance} miles
              </label>
              <input
                id="distance-slider"
                type="range"
                min="1"
                max="50"
                bind:value={maxDistance}
                class="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
              />
            </div>

            <!-- Age Range -->
            <div>
              <span class="mb-2 block text-sm font-medium text-gray-700">
                Age Range: {ageRange.min} - {ageRange.max}
              </span>
              <div class="flex items-center space-x-4">
                <input
                  type="number"
                  min="18"
                  max="100"
                  bind:value={ageRange.min}
                  class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
                  placeholder="Min"
                  aria-label="Minimum age"
                />
                <span class="text-gray-500">to</span>
                <input
                  type="number"
                  min="18"
                  max="100"
                  bind:value={ageRange.max}
                  class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
                  placeholder="Max"
                  aria-label="Maximum age"
                />
              </div>
            </div>

            <!-- Gender Preferences -->
            <div>
              <span class="mb-2 block text-sm font-medium text-gray-700"
                >Gender</span
              >
              <div class="flex flex-wrap gap-2">
                {#each ["male", "female", "non_binary"] as gender}
                  <button
                    onclick={() => {
                      if (selectedGenders.includes(gender)) {
                        selectedGenders = selectedGenders.filter(
                          (g) => g !== gender,
                        );
                      } else {
                        selectedGenders = [...selectedGenders, gender];
                      }
                    }}
                    class="rounded-full border-2 px-3 py-1 text-sm transition-colors {selectedGenders.includes(
                      gender,
                    )
                      ? 'border-purple-500 bg-purple-100 text-purple-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300'}"
                  >
                    {gender
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Events List -->
  <div class="px-4 py-4">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else if filteredEvents.length === 0}
      <div class="py-16 text-center">
        <Calendar class="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 class="mb-2 text-lg font-medium text-gray-900">No events found</h3>
        <p class="mb-6 text-gray-600">
          {searchQuery
            ? "Try adjusting your search or filters"
            : "Be the first to create an event in your area!"}
        </p>
        <button
          onclick={() => goto("/my-rooms")}
          class="inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredEvents as event}
          <EventCard {event} />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    border: none;
  }
</style>
