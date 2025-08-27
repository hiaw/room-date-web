<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { Search, MapPin, Calendar, Filter, Plus } from "lucide-svelte";
  import EventCard from "$lib/components/EventCard.svelte";

  import EventCardSkeleton from "$lib/components/ui/EventCardSkeleton.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  import type {
    LocationState,
    AgeRange,
    GuestCountRange,
    DateRange,
    SortBy,
    SortOrder,
    ActivityLevel,
    EventCategory,
    ActivityLevelOption,
  } from "$lib/types/pages";

  // Location state
  let userLocation = $state<LocationState | null>(null);
  let locationError = $state<string | null>(null);

  // Search and filter state
  let searchQuery = $state("");
  let showFilters = $state(false);
  let selectedGenders: string[] = $state([]);
  let ageRange = $state<AgeRange>({ min: 18, max: 65 });
  let maxDistance = $state(25);
  let selectedCategories: string[] = $state([]);
  let selectedActivityLevel = $state<ActivityLevel>(null);
  let selectedDateRange = $state<DateRange>("any");
  let showPastEvents = $state(false);

  // Advanced filters
  let guestCountRange = $state<GuestCountRange>({ min: 1, max: 50 });
  let sortBy = $state<SortBy>("distance");
  let sortOrder = $state<SortOrder>("asc");

  // Event categories
  const eventCategories: EventCategory[] = [
    { value: "social", label: "Social", emoji: "🎉" },
    { value: "dining", label: "Dining", emoji: "🍽️" },
    { value: "games", label: "Games", emoji: "🎮" },
    { value: "arts", label: "Arts & Culture", emoji: "🎨" },
    { value: "fitness", label: "Fitness", emoji: "💪" },
    { value: "professional", label: "Networking", emoji: "💼" },
    { value: "outdoor", label: "Outdoor", emoji: "🌿" },
    { value: "music", label: "Music", emoji: "🎵" },
  ];

  const activityLevels: ActivityLevelOption[] = [
    {
      value: "low",
      label: "Chill",
      description: "Relaxed, low-key activities",
    },
    { value: "medium", label: "Active", description: "Moderate engagement" },
    {
      value: "high",
      label: "High Energy",
      description: "Active, energetic events",
    },
  ];

  // Get user's location on mount
  onMount(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          locationError = null;
        },
        (error) => {
          console.error("Location error:", error);
          locationError =
            "Could not get your location. Using default location.";
          // Fall back to San Francisco
          userLocation = {
            latitude: 37.7749,
            longitude: -122.4194,
          };
        },
        { timeout: 10000, enableHighAccuracy: true },
      );
    } else {
      locationError = "Geolocation is not supported. Using default location.";
      userLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
      };
    }
  });

  // Reactive query - recreate the query when params change
  let eventsQueryResult = $derived(
    userLocation
      ? useQuery(api.events.getEventsNearUser, {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusMiles: maxDistance,
          limit: 20,
        })
      : null,
  );

  let events = $derived(eventsQueryResult?.data ?? []);
  let loading = $derived(eventsQueryResult?.isLoading ?? true);
  let error = $derived(eventsQueryResult?.error);

  // Debounced search to prevent excessive filtering
  let searchTimeout: ReturnType<typeof setTimeout>;
  function handleSearch(query: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = query.toLowerCase();
    }, 300); // 300ms debounce
  }

  function toggleFilter() {
    showFilters = !showFilters;
  }

  // Memoized filter functions for better performance
  let searchRegex = $derived(
    searchQuery
      ? new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      : null,
  );

  // Pre-compute date ranges for better performance
  let todayRange = $derived(() => {
    const now = Date.now();
    const today = new Date(now);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    return { start: todayStart, end: todayEnd };
  });

  let weekRange = $derived(() => {
    const now = Date.now();
    const today = new Date(now);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const weekStart = new Date(
      todayStart.getTime() - todayStart.getDay() * 24 * 60 * 60 * 1000,
    );
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start: weekStart, end: weekEnd };
  });

  let monthRange = $derived(() => {
    const now = Date.now();
    const today = new Date(now);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { start: monthStart, end: monthEnd };
  });

  // Filter events based on search and filters
  let filteredEvents = $derived(() => {
    let filtered = events.filter((event: unknown) => {
      if (!event) return false;

      // Search filter - use regex for better performance
      if (searchRegex) {
        const searchableText = [
          event.title,
          event.description,
          event.roomTitle,
          event.roomDescription,
          event.category,
          ...(event.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchRegex.test(searchableText)) return false;
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

      // Category filter
      if (selectedCategories.length > 0 && event.category) {
        if (!selectedCategories.includes(event.category)) return false;
      }

      // Activity level filter
      if (
        selectedActivityLevel &&
        event.activityLevel !== selectedActivityLevel
      ) {
        return false;
      }

      // Date range filter - use pre-computed ranges
      if (selectedDateRange !== "any" && event.startTime) {
        const eventDate = new Date(event.startTime);

        switch (selectedDateRange) {
          case "today": {
            const todayRangeObj = todayRange();
            if (
              eventDate < todayRangeObj.start ||
              eventDate >= todayRangeObj.end
            )
              return false;
            break;
          }
          case "this_week": {
            const weekRangeObj = weekRange();
            if (eventDate < weekRangeObj.start || eventDate >= weekRangeObj.end)
              return false;
            break;
          }
          case "this_month": {
            const monthRangeObj = monthRange();
            if (
              eventDate < monthRangeObj.start ||
              eventDate >= monthRangeObj.end
            )
              return false;
            break;
          }
        }
      }

      // Past events filter
      if (!showPastEvents && event.startTime) {
        const eventDate = new Date(event.startTime);
        const now = new Date();
        if (eventDate < now) return false;
      }

      // Guest count filter
      if (event.maxGuests) {
        if (
          event.maxGuests < guestCountRange.min ||
          event.maxGuests > guestCountRange.max
        )
          return false;
      }

      return true;
    });

    // Sort filtered events
    return filtered.sort((a: unknown, b: unknown) => {
      let comparison = 0;

      switch (sortBy) {
        case "distance":
          comparison = (a.distance || 0) - (b.distance || 0);
          break;
        case "date":
          comparison = (a.startTime || 0) - (b.startTime || 0);
          break;
        case "popularity":
          comparison = (b.applicationCount || 0) - (a.applicationCount || 0);
          break;
        case "newest":
          comparison = (b._creationTime || 0) - (a._creationTime || 0);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  });
</script>

<svelte:head>
  <title>Discover Events - Room Dates</title>
</svelte:head>

<div
  class="page-enter min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
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
          class="micro-bounce focus-ring rounded-xl bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200"
          aria-label="Filters"
        >
          <Filter size={20} class="icon-spin" />
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
          class="input-focus w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 transition-all duration-200 focus:outline-none"
          bind:value={searchQuery}
          oninput={(e) => {
            const target = e.target as HTMLInputElement;
            handleSearch(target.value);
          }}
        />
      </div>

      <!-- Location Status -->
      {#if locationError}
        <div class="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
          <div class="flex items-center">
            <MapPin class="mr-2 h-4 w-4 text-orange-500" />
            <span class="text-sm text-orange-700">{locationError}</span>
          </div>
        </div>
      {:else if userLocation}
        <div class="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div class="flex items-center">
            <MapPin class="mr-2 h-4 w-4 text-green-500" />
            <span class="text-sm text-green-700"
              >Showing events within {maxDistance} miles of your location</span
            >
          </div>
        </div>
      {:else}
        <div class="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div class="flex items-center">
            <MapPin class="mr-2 h-4 w-4 text-blue-500" />
            <span class="text-sm text-blue-700">Getting your location...</span>
          </div>
        </div>
      {/if}

      <!-- Filter Panel -->
      {#if showFilters}
        <div
          class="animate-in slide-in-from-top-2 mt-4 space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-4 duration-300"
        >
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

          <!-- Event Categories -->
          <div>
            <span class="mb-3 block text-sm font-medium text-gray-700">
              Event Categories
            </span>
            <div class="grid grid-cols-2 gap-2">
              {#each eventCategories as category (category.value)}
                <button
                  type="button"
                  onclick={() => {
                    if (selectedCategories.includes(category.value)) {
                      selectedCategories = selectedCategories.filter(
                        (c) => c !== category.value,
                      );
                    } else {
                      selectedCategories = [
                        ...selectedCategories,
                        category.value,
                      ];
                    }
                  }}
                  class="micro-bounce focus-ring flex items-center space-x-2 rounded-lg border-2 px-3 py-2 text-sm transition-all duration-200 {selectedCategories.includes(
                    category.value,
                  )
                    ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
                >
                  <span class="transition-transform duration-200"
                    >{category.emoji}</span
                  >
                  <span>{category.label}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Activity Level -->
          <div>
            <span class="mb-3 block text-sm font-medium text-gray-700">
              Activity Level
            </span>
            <div class="space-y-2">
              {#each activityLevels as level (level.value)}
                <button
                  type="button"
                  onclick={() => {
                    selectedActivityLevel =
                      selectedActivityLevel === level.value
                        ? null
                        : level.value;
                  }}
                  class="micro-bounce focus-ring flex w-full items-start space-x-3 rounded-lg border-2 px-3 py-2 text-left transition-all duration-200 {selectedActivityLevel ===
                  level.value
                    ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
                >
                  <div class="flex-1">
                    <div class="font-medium">{level.label}</div>
                    <div class="text-xs opacity-75">{level.description}</div>
                  </div>
                </button>
              {/each}
            </div>
          </div>

          <!-- Date Range -->
          <div>
            <span class="mb-3 block text-sm font-medium text-gray-700">
              When
            </span>
            <div class="grid grid-cols-2 gap-2">
              {#each [{ value: "any" as DateRange, label: "Anytime" }, { value: "today" as DateRange, label: "Today" }, { value: "this_week" as DateRange, label: "This Week" }, { value: "this_month" as DateRange, label: "This Month" }] as option (option.value)}
                <button
                  type="button"
                  onclick={() => (selectedDateRange = option.value)}
                  class="micro-bounce focus-ring rounded-lg border-2 px-3 py-2 text-sm transition-all duration-200 {selectedDateRange ===
                  option.value
                    ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
                >
                  {option.label}
                </button>
              {/each}
            </div>
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
              >Gender Preferences</span
            >
            <div class="flex flex-wrap gap-2">
              {#each ["male", "female", "non_binary", "any"] as gender (gender)}
                <button
                  type="button"
                  onclick={() => {
                    if (selectedGenders.includes(gender)) {
                      selectedGenders = selectedGenders.filter(
                        (g) => g !== gender,
                      );
                    } else {
                      selectedGenders = [...selectedGenders, gender];
                    }
                  }}
                  class="micro-bounce focus-ring rounded-full border-2 px-3 py-1 text-sm transition-all duration-200 {selectedGenders.includes(
                    gender,
                  )
                    ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
                >
                  {gender
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              {/each}
            </div>
          </div>

          <!-- Guest Count Filter -->
          <div>
            <span class="mb-2 block text-sm font-medium text-gray-700">
              Guest Count: {guestCountRange.min} - {guestCountRange.max}
            </span>
            <div class="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="50"
                bind:value={guestCountRange.min}
                class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
                placeholder="Min"
                aria-label="Minimum guest count"
              />
              <span class="text-gray-500">to</span>
              <input
                type="number"
                min="1"
                max="50"
                bind:value={guestCountRange.max}
                class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
                placeholder="Max"
                aria-label="Maximum guest count"
              />
            </div>
          </div>

          <!-- Sort Options -->
          <div>
            <span class="mb-3 block text-sm font-medium text-gray-700">
              Sort By
            </span>
            <div class="space-y-2">
              {#each [{ value: "distance" as SortBy, label: "Distance" }, { value: "date" as SortBy, label: "Date" }, { value: "popularity" as SortBy, label: "Popularity" }, { value: "newest" as SortBy, label: "Newest First" }] as option (option.value)}
                <button
                  type="button"
                  onclick={() => (sortBy = option.value)}
                  class="micro-bounce focus-ring flex w-full items-center justify-between rounded-lg border-2 px-3 py-2 text-sm transition-all duration-200 {sortBy ===
                  option.value
                    ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
                >
                  <span>{option.label}</span>
                  {#if sortBy === option.value}
                    <span
                      onclick={() =>
                        (sortOrder = sortOrder === "asc" ? "desc" : "asc")}
                      class="ml-2 cursor-pointer text-xs hover:text-purple-800"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  {/if}
                </button>
              {/each}
            </div>
          </div>

          <!-- Advanced Options -->
          <div class="border-t border-gray-200 pt-4">
            <div class="flex items-center space-x-3">
              <input
                id="show-past-events"
                type="checkbox"
                bind:checked={showPastEvents}
                class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label for="show-past-events" class="text-sm text-gray-700">
                Show past events
              </label>
            </div>
          </div>

          <!-- Clear Filters -->
          <div class="border-t border-gray-200 pt-4">
            <button
              type="button"
              onclick={() => {
                selectedCategories = [];
                selectedActivityLevel = null;
                selectedDateRange = "any";
                selectedGenders = [];
                ageRange = { min: 18, max: 65 };
                maxDistance = 25;
                showPastEvents = false;
                guestCountRange = { min: 1, max: 50 };
                sortBy = "distance";
                sortOrder = "asc";
              }}
              class="btn-hover-lift focus-ring w-full rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-all duration-200"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Events List -->
  <div class="px-4 py-4">
    {#if loading}
      <div class="space-y-4">
        {#each Array.from({ length: 3 }, (_, index) => index) as index (index)}
          <EventCardSkeleton />
        {/each}
      </div>
    {:else if error}
      <div class="py-16 text-center">
        <div class="mx-auto mb-4 h-12 w-12 text-red-500">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="mb-2 text-lg font-medium text-gray-900">
          Unable to load events
        </h3>
        <p class="mb-6 text-gray-600">
          There was a problem loading events. Please check your connection and
          try again.
        </p>
        <button
          onclick={() => window.location.reload()}
          class="btn-hover-lift inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-6 py-3 text-white transition-all duration-200"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Try Again</span>
        </button>
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
          class="btn-hover-lift focus-ring inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-6 py-3 text-white transition-all duration-200"
        >
          <Plus
            size={20}
            class="transition-transform duration-200 group-hover:rotate-90"
          />
          <span>Create Event</span>
        </button>
      </div>
    {:else}
      <div class="space-y-4">
        {#each filteredEvents as event, index (event._id)}
          <div class="stagger-item" style="animation-delay: {index * 0.1}s">
            <EventCard event={event as EventData} />
          </div>
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
