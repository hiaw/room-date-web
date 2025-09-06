<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { MapPin, Calendar, Plus, Settings } from "lucide-svelte";
  import { createDebouncedState } from "$lib/utils/debounce.js";

  // Import our extracted components
  import EventSearchBar from "$lib/components/discover/EventSearchBar.svelte";
  import DiscoverFilters from "$lib/components/discover/DiscoverFilters.svelte";
  import DiscoverEventGrid from "$lib/components/discover/DiscoverEventGrid.svelte";

  // Import the location service and filter store
  import {
    getCurrentLocation,
    getDefaultLocation,
  } from "$lib/services/location-service.js";
  import { discoverFilters } from "$lib/stores/discover-filters.js";

  import type { EventData } from "$lib/types/components";
  import type { LocationState } from "$lib/types/pages";
  import type { UserProfileResponse } from "$lib/types/domains/user-types.js";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Get user profile to check for saved location
  let convex = useConvexClient();
  let profileQuery = useQuery(api.userProfiles.getUserProfile, {});
  let profile = $derived(profileQuery?.data as UserProfileResponse | undefined);

  // Location state
  let userLocation = $state<LocationState | null>(null);
  let locationError = $state<string | null>(null);
  let showLocationPrompt = $state(false);

  // Get user's location on mount using the location service or profile
  onMount(async () => {
    try {
      // First, try to get location from user profile
      if (profile?.profile?.latitude && profile?.profile?.longitude) {
        userLocation = {
          latitude: profile.profile.latitude,
          longitude: profile.profile.longitude,
          city: profile.profile.location || "Unknown",
        };
        locationError = null;
        return;
      }

      // If no saved location, try to get current location
      const location = await getCurrentLocation();
      userLocation = location;
      locationError = null;

      // Optionally save this location to user profile
      if (profile?.profile && !profile.profile.latitude) {
        showLocationPrompt = true;
      }
    } catch (error) {
      console.error("Location error:", error);
      locationError =
        "Could not get your location. Please enable location access or add your location in profile settings.";
      showLocationPrompt = true;
    }
  });

  // Also watch for profile changes
  $effect(() => {
    if (
      profile?.profile?.latitude &&
      profile?.profile?.longitude &&
      !userLocation
    ) {
      userLocation = {
        latitude: profile.profile.latitude,
        longitude: profile.profile.longitude,
        city: profile.profile.location || "Unknown",
      };
      locationError = null;
      showLocationPrompt = false;
    }
  });

  async function handleSaveLocation() {
    try {
      const location = await getCurrentLocation();

      // Save to user profile
      await convex.mutation(api.userProfiles.updateUserProfile, {
        latitude: location.latitude,
        longitude: location.longitude,
        location:
          (location as LocationState & { city?: string }).city ||
          `${location.latitude}, ${location.longitude}`,
        locationSharing: true,
      });

      userLocation = location;
      locationError = null;
      showLocationPrompt = false;
    } catch (error) {
      console.error("Failed to get/save location:", error);
      alert(
        "Could not get your location. Please enable location permissions or add your location manually in profile settings.",
      );
    }
  }

  function handleSkipLocation() {
    showLocationPrompt = false;
    userLocation = getDefaultLocation();
    locationError =
      "Using default location. Add your location in profile settings for better event recommendations.";
  }

  // Debounce distance filter changes to prevent excessive queries
  const debouncedDistance = createDebouncedState(
    $discoverFilters.maxDistance,
    500,
  );
  $effect(() => {
    debouncedDistance.current = $discoverFilters.maxDistance;
  });

  // Reactive query - recreate the query when params change (with debounced distance)
  let eventsQueryResult = $derived(
    userLocation && api
      ? useQuery(api.events.getEventsNearUser, {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusMiles: debouncedDistance.debounced,
          limit: 20,
        })
      : null,
  );

  let events = $derived((eventsQueryResult?.data ?? []) as EventData[]);
  let loading = $derived(eventsQueryResult?.isLoading ?? true);
  let error = $derived(eventsQueryResult?.error);
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
        <DiscoverFilters />
      </div>

      <!-- Search Bar Component -->
      <EventSearchBar />

      <!-- Location Status -->
      {#if showLocationPrompt}
        <div class="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
          <div class="flex items-start justify-between">
            <div class="flex items-start">
              <MapPin class="mt-0.5 mr-2 h-4 w-4 text-purple-500" />
              <div>
                <p class="text-sm font-medium text-purple-800">
                  Enable Location for Better Discovery
                </p>
                <p class="mt-1 text-xs text-purple-700">
                  Share your location to see events near you and let others find
                  your events.
                </p>
              </div>
            </div>
            <div class="ml-4 flex space-x-2">
              <button
                onclick={handleSaveLocation}
                class="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
              >
                Enable
              </button>
              <button
                onclick={handleSkipLocation}
                class="rounded-lg border border-purple-300 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      {:else if locationError}
        <div class="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <MapPin class="mr-2 h-4 w-4 text-orange-500" />
              <span class="text-sm text-orange-700">{locationError}</span>
            </div>
            <button
              onclick={() => goto("/profile/edit")}
              class="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700"
            >
              <Settings size={12} class="mr-1 inline" />
              Settings
            </button>
          </div>
        </div>
      {:else if userLocation}
        <div class="mt-3 rounded-lg border border-green-200 bg-green-50 p-3">
          <div class="flex items-center">
            <MapPin class="mr-2 h-4 w-4 text-green-500" />
            <span class="text-sm text-green-700"
              >Showing events within {$discoverFilters.maxDistance} miles of {userLocation.city ||
                "your location"}</span
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
    </div>
  </div>

  <!-- Events Grid Component -->
  <div class="px-4 py-4">
    {#if loading}
      <div class="space-y-4">
        {#each Array.from({ length: 3 }, (_, index) => index) as index (index)}
          <!-- We'll need to import the skeleton component -->
          <div class="h-48 animate-pulse rounded-lg bg-gray-200 p-4"></div>
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
    {:else if events.length === 0}
      <div class="py-16 text-center">
        <Calendar class="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 class="mb-2 text-lg font-medium text-gray-900">No events found</h3>
        <p class="mb-6 text-gray-600">
          Be the first to create an event in your area!
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
      <DiscoverEventGrid {events} />
    {/if}
  </div>
</div>
