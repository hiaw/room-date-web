<script lang="ts">
  import { User, MapPin } from "lucide-svelte";
  import type { OnboardingState } from "$lib/stores/onboarding.js";
  import { getMaxBirthDate, AGE_ERROR_MESSAGE } from "$lib/constants/age.js";

  interface StepProfileAndLocationProps {
    state: OnboardingState;
    needsDateOfBirth?: boolean;
    onDisplayNameChange: (value: string) => void;
    onDateOfBirthChange: (value: string) => void;
    onBioChange: (value: string) => void;
    onLocationSharingChange: (value: boolean) => void;
    onGetCurrentLocation: () => void;
  }

  let {
    state,
    needsDateOfBirth = false,
    onDisplayNameChange,
    onDateOfBirthChange,
    onBioChange,
    onLocationSharingChange,
    onGetCurrentLocation,
  }: StepProfileAndLocationProps = $props();

  // Calculate max birth date once for performance
  const maxBirthDate = getMaxBirthDate();
</script>

<div class="space-y-6">
  <!-- Basic Info Section -->
  <div class="space-y-4">
    <div class="flex items-center space-x-2 text-purple-600">
      <User size={20} />
      <h3 class="font-medium">Basic Information</h3>
    </div>

    <div>
      <label
        for="displayName"
        class="mb-1 block text-sm font-medium text-gray-700"
      >
        Display Name
      </label>
      <input
        id="displayName"
        value={state.displayName}
        onchange={(e) => onDisplayNameChange(e.currentTarget.value)}
        type="text"
        placeholder="How should others see your name?"
        class="w-full rounded-lg border {state.validationErrors.displayName
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'} px-3 py-2 focus:ring-1 focus:outline-none"
      />
      {#if state.validationErrors.displayName}
        <p class="mt-1 text-sm text-red-600">
          {state.validationErrors.displayName}
        </p>
      {/if}
    </div>

    {#if needsDateOfBirth}
      <div>
        <label
          for="dateOfBirth"
          class="mb-1 block text-sm font-medium text-gray-700"
        >
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          value={state.dateOfBirth}
          onchange={(e) => onDateOfBirthChange(e.currentTarget.value)}
          type="date"
          max={maxBirthDate}
          class="w-full rounded-lg border {state.validationErrors.dateOfBirth
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'} px-3 py-2 focus:ring-1 focus:outline-none"
        />
        <p class="mt-1 text-xs text-gray-500">
          {AGE_ERROR_MESSAGE}
        </p>
        {#if state.validationErrors.dateOfBirth}
          <p class="mt-1 text-sm text-red-600">
            {state.validationErrors.dateOfBirth}
          </p>
        {/if}
      </div>
    {/if}

    <div>
      <label for="bio" class="mb-1 block text-sm font-medium text-gray-700">
        About You <span class="text-gray-400">(Optional)</span>
      </label>
      <textarea
        id="bio"
        value={state.bio}
        onchange={(e) => onBioChange(e.currentTarget.value)}
        placeholder="Tell others about yourself (optional)..."
        rows="3"
        class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
      ></textarea>
      <p class="mt-1 text-xs text-gray-500">
        This is optional - focus on photos and availability instead
      </p>
    </div>
  </div>

  <!-- Divider -->
  <hr class="border-gray-200" />

  <!-- Location Section -->
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
      You can change these settings anytime in your profile preferences.
    </p>
  </div>
</div>
