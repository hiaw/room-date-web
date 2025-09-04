<script lang="ts">
  import { MapPin } from "lucide-svelte";
  import type { OnboardingState } from "$lib/stores/onboarding.js";

  interface StepLocationInfoProps {
    state: OnboardingState;
    onLocationSharingChange: (value: boolean) => void;
    onGetCurrentLocation: () => void;
  }

  let {
    state,
    onLocationSharingChange,
    onGetCurrentLocation,
  }: StepLocationInfoProps = $props();
</script>

<div class="space-y-4">
  <div class="flex items-center space-x-2 text-purple-600">
    <MapPin size={20} />
    <h3 class="font-medium">Location Setup</h3>
  </div>

  <p class="text-sm text-gray-600">
    Add your location to discover events near you and let others find your
    events.
  </p>

  {#if state.latitude && state.longitude}
    <div class="rounded-lg border border-green-200 bg-green-50 p-4">
      <p class="text-sm font-medium text-green-800">Location Set!</p>
      <p class="mt-1 text-sm text-green-700">
        {state.location ||
          `${state.latitude.toFixed(4)}, ${state.longitude.toFixed(4)}`}
      </p>
    </div>
  {:else}
    <button
      onclick={onGetCurrentLocation}
      disabled={state.gettingLocation}
      class="flex w-full items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {#if state.gettingLocation}
        <div
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        ></div>
        <span>Getting location...</span>
      {:else}
        <MapPin size={16} />
        <span>Use Current Location</span>
      {/if}
    </button>

    {#if state.validationErrors.location}
      <div class="rounded-lg border border-red-200 bg-red-50 p-3">
        <p class="text-sm text-red-700">{state.validationErrors.location}</p>
      </div>
    {/if}
  {/if}

  <div class="flex items-center space-x-2">
    <input
      id="locationSharing"
      type="checkbox"
      checked={state.locationSharing}
      onchange={(e) => onLocationSharingChange(e.currentTarget.checked)}
      class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
    />
    <label for="locationSharing" class="text-sm text-gray-700">
      Share my location for event discovery
    </label>
  </div>

  <p class="text-xs text-gray-500">
    You can change location settings anytime in your profile preferences.
  </p>
</div>
