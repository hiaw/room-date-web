<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { MapPin, User, Calendar } from "lucide-svelte";
  import Button from "../ui/Button.svelte";
  import type { OnboardingModalProps } from "$lib/types/components.js";

  let {
    open = $bindable(),
    onClose,
    onComplete,
  }: OnboardingModalProps = $props();

  let convex = useConvexClient();
  let step = $state(1);
  let saving = $state(false);

  // Form data
  let displayName = $state("");
  let dateOfBirth = $state("");
  let bio = $state("");
  let location = $state("");
  let latitude = $state<number | undefined>(undefined);
  let longitude = $state<number | undefined>(undefined);
  let locationSharing = $state(true);
  let gettingLocation = $state(false);

  // Calculate max date for date of birth (18 years ago)
  let maxDateOfBirth = $derived(() => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, 11, 31);
    return eighteenYearsAgo.toISOString().split("T")[0];
  });

  async function handleNext() {
    if (step === 1) {
      // Validate basic info
      if (!displayName.trim() || !dateOfBirth) {
        alert("Please fill in all required fields");
        return;
      }
      step = 2;
    } else if (step === 2) {
      // Location step - can skip
      step = 3;
    } else if (step === 3) {
      // Final step - save profile
      await handleSave();
    }
  }

  function handleBack() {
    if (step > 1) {
      step--;
    }
  }

  function handleSkipLocation() {
    step = 3;
  }

  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
      return;
    }

    gettingLocation = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;

          // Just use coordinates as location description for now
          // This avoids CSP issues with external geocoding services
          location = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        } catch (error) {
          console.error("Location processing failed:", error);
          location = `${latitude?.toFixed(4) || "0"}, ${longitude?.toFixed(4) || "0"}`;
        } finally {
          gettingLocation = false;
        }
      },
      (error) => {
        console.error("Location error:", error);
        let errorMessage =
          "Could not get your location. You can add this later in settings.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. You can enable this later in settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. You can add this later in settings.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. You can add this later in settings.";
            break;
        }

        alert(errorMessage);
        gettingLocation = false;
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }

  async function handleSave() {
    saving = true;
    try {
      await convex.mutation(api.userProfiles.updateUserProfile, {
        displayName: displayName.trim(),
        dateOfBirth: new Date(dateOfBirth).getTime(),
        bio: bio.trim() || undefined, // Only save if provided
        location: location || undefined,
        latitude,
        longitude,
        locationSharing,
      });

      // Update settings with location preferences
      await convex.mutation(api.userProfiles.updateUserSettings, {
        maxDistance: 25, // Default 25 miles
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      saving = false;
    }
  }

  function handleClose() {
    if (!saving) {
      onClose();
    }
  }
</script>

{#if open}
  <!-- Modal backdrop -->
  <div
    class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <!-- Header -->
      <div class="mb-6 text-center">
        <h2 class="text-2xl font-bold text-gray-900">Welcome to Room Dates!</h2>
        <p class="mt-2 text-sm text-gray-600">
          Let's set up your profile to get started
        </p>

        <!-- Progress indicator -->
        <div class="mt-4 flex justify-center space-x-2">
          {#each [1, 2, 3] as i (i)}
            <div
              class="h-2 w-8 rounded-full {step >= i
                ? 'bg-purple-600'
                : 'bg-gray-200'}"
            ></div>
          {/each}
        </div>
      </div>

      {#if step === 1}
        <!-- Basic Info -->
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
              bind:value={displayName}
              type="text"
              placeholder="How should others see your name?"
              class="w-full rounded-lg border {!displayName.trim()
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'} px-3 py-2 focus:ring-1 focus:outline-none"
            />
          </div>

          <div>
            <label
              for="dateOfBirth"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              bind:value={dateOfBirth}
              type="date"
              max={maxDateOfBirth()}
              class="w-full rounded-lg border {!dateOfBirth
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'} px-3 py-2 focus:ring-1 focus:outline-none"
            />
            <p class="mt-1 text-xs text-gray-500">Must be 18 or older</p>
          </div>

          <div>
            <label
              for="bio"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              About You <span class="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="bio"
              bind:value={bio}
              placeholder="Tell others about yourself (optional)..."
              rows="3"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500">
              This is optional - focus on photos and availability instead
            </p>
          </div>
        </div>
      {:else if step === 2}
        <!-- Location -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2 text-purple-600">
            <MapPin size={20} />
            <h3 class="font-medium">Location Setup</h3>
          </div>

          <p class="text-sm text-gray-600">
            Add your location to discover events near you and let others find
            your events.
          </p>

          {#if latitude && longitude}
            <div class="rounded-lg border border-green-200 bg-green-50 p-4">
              <p class="text-sm font-medium text-green-800">Location Set!</p>
              <p class="mt-1 text-sm text-green-700">
                {location || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
              </p>
            </div>
          {:else}
            <button
              onclick={getCurrentLocation}
              disabled={gettingLocation}
              class="flex w-full items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {#if gettingLocation}
                <div
                  class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
                <span>Getting location...</span>
              {:else}
                <MapPin size={16} />
                <span>Use Current Location</span>
              {/if}
            </button>
          {/if}

          <div class="flex items-center space-x-2">
            <input
              id="locationSharing"
              type="checkbox"
              bind:checked={locationSharing}
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label for="locationSharing" class="text-sm text-gray-700">
              Share my location for event discovery
            </label>
          </div>

          <p class="text-xs text-gray-500">
            You can change location settings anytime in your profile
            preferences.
          </p>
        </div>
      {:else}
        <!-- Summary -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2 text-purple-600">
            <Calendar size={20} />
            <h3 class="font-medium">Ready to Go!</h3>
          </div>

          <p class="text-sm text-gray-600">
            Your profile is ready! You can now:
          </p>

          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex items-center space-x-2">
              <div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
              <span>Discover events near you</span>
            </li>
            <li class="flex items-center space-x-2">
              <div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
              <span>Create your own rooms and events</span>
            </li>
            <li class="flex items-center space-x-2">
              <div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
              <span>Connect with other users</span>
            </li>
          </ul>

          <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p class="text-sm text-blue-800">
              🎉 <strong>Welcome bonus:</strong> Your profile is now complete and
              optimized for the best experience!
            </p>
          </div>
        </div>
      {/if}

      <!-- Actions -->
      <div class="mt-6 flex justify-between">
        <div>
          {#if step > 1}
            <button
              onclick={handleBack}
              disabled={saving}
              class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Back
            </button>
          {:else if step === 2}
            <button
              onclick={handleSkipLocation}
              disabled={saving}
              class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Skip
            </button>
          {/if}
        </div>

        <div class="flex space-x-2">
          {#if step < 3}
            <button
              onclick={handleClose}
              disabled={saving}
              class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Later
            </button>
          {/if}

          <Button
            onclick={handleNext}
            disabled={saving ||
              (step === 1 && (!displayName.trim() || !dateOfBirth))}
          >
            {#if saving}
              <div
                class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
            {/if}
            {step === 3 ? "Complete Setup" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
