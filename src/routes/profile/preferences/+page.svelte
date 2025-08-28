<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Save, Bell, Heart, Palette } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Fetch current profile and settings
  let profileQuery = useQuery(api.userProfiles.getUserProfile, {});
  let settings = $derived(profileQuery?.data?.settings);
  let loading = $derived(profileQuery?.isLoading ?? true);

  // Convex client for mutations
  let convex = useConvexClient();

  // Form state - initialize with defaults
  let pushNotifications = $state(true);
  let emailNotifications = $state(true);
  let messageNotifications = $state(true);
  let applicationNotifications = $state(true);
  let eventReminderNotifications = $state(true);
  let theme = $state<"light" | "dark" | "system">("system");
  let ageRangeMin = $state(18);
  let ageRangeMax = $state(65);
  let maxDistance = $state(25);
  let genderPreferences = $state<string[]>([]);

  let saving = $state(false);

  // Initialize form when settings load
  $effect(() => {
    if (settings) {
      pushNotifications = settings.pushNotifications ?? true;
      emailNotifications = settings.emailNotifications ?? true;
      messageNotifications = settings.messageNotifications ?? true;
      applicationNotifications = settings.applicationNotifications ?? true;
      eventReminderNotifications = settings.eventReminderNotifications ?? true;
      theme = settings.theme ?? "system";
      ageRangeMin = settings.ageRangePreference?.min ?? 18;
      ageRangeMax = settings.ageRangePreference?.max ?? 65;
      maxDistance = settings.maxDistance ?? 25;
      genderPreferences = settings.genderPreferences ?? [];
    }
  });

  async function handleSave(event: Event) {
    event.preventDefault();
    saving = true;

    try {
      await convex.mutation(api.userProfiles.updateUserSettings, {
        pushNotifications,
        emailNotifications,
        messageNotifications,
        applicationNotifications,
        eventReminderNotifications,
        theme,
        ageRangePreference: {
          min: ageRangeMin,
          max: ageRangeMax,
        },
        maxDistance,
        genderPreferences:
          genderPreferences.length > 0 ? genderPreferences : undefined,
      });

      goto("/profile");
    } catch (error) {
      console.error("Failed to update preferences:", error);
      alert("Failed to update preferences. Please try again.");
    } finally {
      saving = false;
    }
  }

  function handleBack() {
    goto("/profile");
  }

  function toggleGenderPreference(gender: string) {
    if (genderPreferences.includes(gender)) {
      genderPreferences = genderPreferences.filter((g) => g !== gender);
    } else {
      genderPreferences = [...genderPreferences, gender];
    }
  }
</script>

<svelte:head>
  <title>Preferences - Room Dates</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
>
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button
            onclick={handleBack}
            class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50"
            title="Back to Profile"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Preferences</h1>
            <p class="text-sm text-gray-600">Customize your experience</p>
          </div>
        </div>
        <Button
          onclick={() => handleSave(new Event("click"))}
          disabled={saving}
          class="bg-purple-600 text-white hover:bg-purple-700"
        >
          {#if saving}
            <LoadingSpinner />
          {:else}
            <Save size={16} />
          {/if}
          <span>Save</span>
        </Button>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else}
      <form onsubmit={handleSave} class="mx-auto max-w-2xl space-y-6">
        <!-- Notifications Section -->
        <div
          class="rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
        >
          <div class="border-b border-gray-100 px-8 py-6">
            <h3
              class="flex items-center space-x-2 text-lg font-semibold text-gray-900"
            >
              <Bell size={20} />
              <span>Notifications</span>
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              Choose what notifications you'd like to receive
            </p>
          </div>

          <div class="space-y-4 p-8">
            <label class="flex items-center justify-between">
              <div>
                <span class="font-medium text-gray-900">Push Notifications</span
                >
                <p class="text-sm text-gray-600">Get notified on your device</p>
              </div>
              <input
                type="checkbox"
                bind:checked={pushNotifications}
                class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label class="flex items-center justify-between">
              <div>
                <span class="font-medium text-gray-900"
                  >Email Notifications</span
                >
                <p class="text-sm text-gray-600">Receive updates via email</p>
              </div>
              <input
                type="checkbox"
                bind:checked={emailNotifications}
                class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label class="flex items-center justify-between">
              <div>
                <span class="font-medium text-gray-900"
                  >Message Notifications</span
                >
                <p class="text-sm text-gray-600">
                  New messages from connections
                </p>
              </div>
              <input
                type="checkbox"
                bind:checked={messageNotifications}
                class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label class="flex items-center justify-between">
              <div>
                <span class="font-medium text-gray-900"
                  >Application Notifications</span
                >
                <p class="text-sm text-gray-600">
                  When someone applies to your events
                </p>
              </div>
              <input
                type="checkbox"
                bind:checked={applicationNotifications}
                class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>

            <label class="flex items-center justify-between">
              <div>
                <span class="font-medium text-gray-900">Event Reminders</span>
                <p class="text-sm text-gray-600">
                  Reminders for upcoming events
                </p>
              </div>
              <input
                type="checkbox"
                bind:checked={eventReminderNotifications}
                class="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        <!-- Discovery Preferences Section -->
        <div
          class="rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
        >
          <div class="border-b border-gray-100 px-8 py-6">
            <h3
              class="flex items-center space-x-2 text-lg font-semibold text-gray-900"
            >
              <Heart size={20} />
              <span>Discovery Preferences</span>
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              Help us show you relevant events and connections
            </p>
          </div>

          <div class="space-y-6 p-8">
            <!-- Age Range -->
            <div>
              <div class="block font-medium text-gray-900">Age Range</div>
              <p class="mb-4 text-sm text-gray-600">
                Show events for people between {ageRangeMin} and {ageRangeMax} years
                old
              </p>
              <div class="space-y-4">
                <div>
                  <label for="age-range-min" class="block text-sm text-gray-700"
                    >Minimum Age: {ageRangeMin}</label
                  >
                  <input
                    id="age-range-min"
                    type="range"
                    min="18"
                    max="100"
                    bind:value={ageRangeMin}
                    class="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                    style="background-image: linear-gradient(to right, rgb(147 51 234), rgb(147 51 234));"
                  />
                </div>
                <div>
                  <label for="age-range-max" class="block text-sm text-gray-700"
                    >Maximum Age: {ageRangeMax}</label
                  >
                  <input
                    id="age-range-max"
                    type="range"
                    min="18"
                    max="100"
                    bind:value={ageRangeMax}
                    class="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                    style="background-image: linear-gradient(to right, rgb(147 51 234), rgb(147 51 234));"
                  />
                </div>
              </div>
            </div>

            <!-- Distance -->
            <div>
              <label for="max-distance" class="block font-medium text-gray-900"
                >Maximum Distance</label
              >
              <p class="mb-4 text-sm text-gray-600">
                Show events within {maxDistance} miles from your location
              </p>
              <input
                id="max-distance"
                type="range"
                min="5"
                max="100"
                bind:value={maxDistance}
                class="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
                style="background-image: linear-gradient(to right, rgb(147 51 234), rgb(147 51 234));"
              />
              <div class="mt-1 flex justify-between text-xs text-gray-500">
                <span>5 miles</span>
                <span>100 miles</span>
              </div>
            </div>

            <!-- Gender Preferences -->
            <fieldset>
              <legend class="block font-medium text-gray-900">
                Gender Preferences
              </legend>
              <p class="mb-4 text-sm text-gray-600">
                Show events from people of these genders (leave empty for all)
              </p>
              <div class="grid grid-cols-2 gap-3">
                {#each ["male", "female", "non_binary", "other"] as gender (gender)}
                  <button
                    type="button"
                    onclick={() => toggleGenderPreference(gender)}
                    class={`rounded-xl px-4 py-3 text-left transition-colors ${
                      genderPreferences.includes(gender)
                        ? "bg-purple-100 text-purple-700 ring-2 ring-purple-600"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {gender === "non_binary"
                      ? "Non-binary"
                      : gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                {/each}
              </div>
            </fieldset>
          </div>
        </div>

        <!-- Appearance Section -->
        <div
          class="rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
        >
          <div class="border-b border-gray-100 px-8 py-6">
            <h3
              class="flex items-center space-x-2 text-lg font-semibold text-gray-900"
            >
              <Palette size={20} />
              <span>Appearance</span>
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              Customize how the app looks
            </p>
          </div>

          <div class="space-y-4 p-8">
            <fieldset>
              <legend class="block font-medium text-gray-900">Theme</legend>
              <p class="mb-4 text-sm text-gray-600">
                Choose your preferred theme
              </p>
              <div class="grid grid-cols-3 gap-3">
                {#each [["light", "Light"], ["dark", "Dark"], ["system", "System"]] as [value, label] (value)}
                  <button
                    type="button"
                    onclick={() =>
                      (theme = value as "light" | "dark" | "system")}
                    class={`rounded-xl px-4 py-3 text-center transition-colors ${
                      theme === value
                        ? "bg-purple-100 text-purple-700 ring-2 ring-purple-600"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                {/each}
              </div>
            </fieldset>
          </div>
        </div>

        <!-- Save Button (Mobile) -->
        <div class="md:hidden">
          <Button
            type="submit"
            disabled={saving}
            class="flex w-full items-center justify-center space-x-2"
          >
            {#if saving}
              <LoadingSpinner />
            {:else}
              <Save size={16} />
            {/if}
            <span>Save Preferences</span>
          </Button>
        </div>
      </form>
    {/if}
  </div>
</div>
