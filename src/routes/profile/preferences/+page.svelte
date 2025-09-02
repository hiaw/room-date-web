<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { loadApi, type ConvexAPI } from "../../../lib/convex/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Save } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import NotificationPreferences from "$lib/components/profile/NotificationPreferences.svelte";
  import DiscoveryPreferences from "$lib/components/profile/DiscoveryPreferences.svelte";
  import AppearancePreferences from "$lib/components/profile/AppearancePreferences.svelte";
  import { browser } from "$app/environment";

  // Import API only on client side
  let api: ConvexAPI | null = null;

  if (browser) {
    loadApi()
      .then((loadedApi) => {
        api = loadedApi;
      })
      .catch((error) => {
        console.error("Failed to load Convex API in preferences page:", error);
      });
  }

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Fetch current profile and settings
  let profileQuery = $derived(
    api ? useQuery((api as ConvexAPI).userProfiles.getUserProfile, {}) : null,
  );
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

    if (!api) {
      alert("API not available. Please try again.");
      return;
    }

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

  // Event handlers for form components
  function handlePushNotificationsChange(value: boolean) {
    pushNotifications = value;
  }

  function handleEmailNotificationsChange(value: boolean) {
    emailNotifications = value;
  }

  function handleMessageNotificationsChange(value: boolean) {
    messageNotifications = value;
  }

  function handleApplicationNotificationsChange(value: boolean) {
    applicationNotifications = value;
  }

  function handleEventReminderNotificationsChange(value: boolean) {
    eventReminderNotifications = value;
  }

  function handleAgeRangeMinChange(value: number) {
    ageRangeMin = value;
  }

  function handleAgeRangeMaxChange(value: number) {
    ageRangeMax = value;
  }

  function handleMaxDistanceChange(value: number) {
    maxDistance = value;
  }

  function handleThemeChange(value: "light" | "dark" | "system") {
    theme = value;
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
        <NotificationPreferences
          {pushNotifications}
          {emailNotifications}
          {messageNotifications}
          {applicationNotifications}
          {eventReminderNotifications}
          onPushNotificationsChange={handlePushNotificationsChange}
          onEmailNotificationsChange={handleEmailNotificationsChange}
          onMessageNotificationsChange={handleMessageNotificationsChange}
          onApplicationNotificationsChange={handleApplicationNotificationsChange}
          onEventReminderNotificationsChange={handleEventReminderNotificationsChange}
        />

        <!-- Discovery Preferences Section -->
        <DiscoveryPreferences
          {ageRangeMin}
          {ageRangeMax}
          {maxDistance}
          {genderPreferences}
          onAgeRangeMinChange={handleAgeRangeMinChange}
          onAgeRangeMaxChange={handleAgeRangeMaxChange}
          onMaxDistanceChange={handleMaxDistanceChange}
          onGenderToggle={toggleGenderPreference}
        />

        <!-- Appearance Section -->
        <AppearancePreferences {theme} onThemeChange={handleThemeChange} />

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
