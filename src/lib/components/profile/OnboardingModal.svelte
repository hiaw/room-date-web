<script lang="ts">
  import { useConvexClient, useQuery } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import Button from "../ui/Button.svelte";
  import StepProfileAndLocation from "./onboarding/StepProfileAndLocation.svelte";
  import StepFinalReview from "./onboarding/StepFinalReview.svelte";
  import { onboardingStore } from "$lib/stores/onboarding.js";
  import {
    validateBasicInfo,
    getCurrentLocationData,
  } from "$lib/utils/onboarding-helpers.js";
  import type { OnboardingModalProps } from "$lib/types/components.js";

  let {
    open = $bindable(),
    onClose,
    onComplete,
  }: OnboardingModalProps = $props();

  let convex = useConvexClient();

  // Check if user needs to provide date of birth (OAuth users who don't have it)
  let userProfile = useQuery(api.userProfiles.getUserProfile, {});
  let needsDateOfBirth = $derived(
    Boolean(
      userProfile.data?.profile &&
        userProfile.data.profile.dateOfBirth === undefined,
    ),
  );

  // Subscribe to store
  let state = $derived($onboardingStore);

  async function handleNext() {
    if (state.step === 1) {
      // Validate basic info
      onboardingStore.clearErrors();
      const validation = validateBasicInfo(state, needsDateOfBirth);

      if (!validation.isValid) {
        // Set errors in store
        Object.entries(validation.errors).forEach(([field, error]) => {
          if (error) {
            onboardingStore.setError(
              field as keyof typeof validation.errors,
              error,
            );
          }
        });
        return;
      }

      onboardingStore.nextStep();
    } else if (state.step === 2) {
      // Final step - save profile
      await handleSave();
    }
  }

  function handleBack() {
    if (state.step > 1) {
      onboardingStore.previousStep();
    }
  }

  async function getCurrentLocation() {
    onboardingStore.setField("gettingLocation", true);
    onboardingStore.setError("location", undefined);

    try {
      const locationData = await getCurrentLocationData();
      onboardingStore.setField("latitude", locationData.latitude);
      onboardingStore.setField("longitude", locationData.longitude);
      onboardingStore.setField("location", locationData.location);
    } catch (error) {
      onboardingStore.setError(
        "location",
        error instanceof Error ? error.message : "Location error",
      );
    } finally {
      onboardingStore.setField("gettingLocation", false);
    }
  }

  async function handleSave() {
    onboardingStore.setField("saving", true);
    onboardingStore.setError("save", undefined);

    try {
      const profileData: {
        displayName: string;
        bio?: string;
        location?: string;
        latitude?: number;
        longitude?: number;
        locationSharing: boolean;
        dateOfBirth?: number;
      } = {
        displayName: state.displayName.trim(),
        bio: state.bio.trim() || undefined,
        location: state.location || undefined,
        latitude: state.latitude,
        longitude: state.longitude,
        locationSharing: state.locationSharing,
      };

      // Add dateOfBirth if user needs to provide it and has provided it
      if (needsDateOfBirth && state.dateOfBirth) {
        profileData.dateOfBirth = new Date(state.dateOfBirth).getTime();
      }

      await convex.mutation(api.userProfiles.updateUserProfile, profileData);

      // Update settings with location preferences
      await convex.mutation(api.userProfiles.updateUserSettings, {
        maxDistance: 25, // Default 25 miles
      });

      onComplete();
      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
      onboardingStore.setError(
        "save",
        "Failed to save profile. Please try again.",
      );
    } finally {
      onboardingStore.setField("saving", false);
    }
  }

  // Field change handlers
  const handleDisplayNameChange = (value: string) =>
    onboardingStore.setField("displayName", value);
  const handleDateOfBirthChange = (value: string) =>
    onboardingStore.setField("dateOfBirth", value);
  const handleBioChange = (value: string) =>
    onboardingStore.setField("bio", value);
  const handleLocationSharingChange = (value: boolean) =>
    onboardingStore.setField("locationSharing", value);
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
          {#each [1, 2] as i (i)}
            <div
              class="h-2 w-8 rounded-full {state.step >= i
                ? 'bg-purple-600'
                : 'bg-gray-200'}"
            ></div>
          {/each}
        </div>
      </div>

      {#if state.step === 1}
        <!-- Combined Profile and Location -->
        <StepProfileAndLocation
          {state}
          {needsDateOfBirth}
          onDisplayNameChange={handleDisplayNameChange}
          onDateOfBirthChange={handleDateOfBirthChange}
          onBioChange={handleBioChange}
          onLocationSharingChange={handleLocationSharingChange}
          onGetCurrentLocation={getCurrentLocation}
        />
      {:else}
        <!-- Summary -->
        <StepFinalReview {state} />
      {/if}

      <div class="mt-6 flex justify-between">
        <div>
          {#if state.step > 1}
            <button
              onclick={handleBack}
              disabled={state.saving}
              class="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Back
            </button>
          {/if}
        </div>

        <div class="flex space-x-2">
          <Button
            onclick={handleNext}
            disabled={state.saving ||
              (state.step === 1 &&
                (!state.displayName.trim() ||
                  (needsDateOfBirth && !state.dateOfBirth)))}
          >
            {#if state.saving}
              <div
                class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
            {/if}
            {state.step === 2 ? "Complete Setup" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  </div>
{/if}
