<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Save } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import NotificationPreferences from "$lib/components/profile/NotificationPreferences.svelte";

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

  let saving = $state(false);

  // Initialize form when settings load
  $effect(() => {
    if (settings) {
      pushNotifications = settings.pushNotifications ?? true;
      emailNotifications = settings.emailNotifications ?? true;
      messageNotifications = settings.messageNotifications ?? true;
      applicationNotifications = settings.applicationNotifications ?? true;
      eventReminderNotifications = settings.eventReminderNotifications ?? true;
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
      });

      goto("/settings");
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      alert("Failed to update notification preferences. Please try again.");
    } finally {
      saving = false;
    }
  }

  function handleBack() {
    goto("/settings");
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
</script>

<svelte:head>
  <title>Notification Preferences - Room Dates</title>
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
          <Button
            variant="secondary"
            size="sm"
            onclick={handleBack}
            class="p-2"
          >
            <ArrowLeft class="h-5 w-5" />
          </Button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
            <p class="text-sm text-gray-600">
              Manage your notification preferences
            </p>
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
            <span>Save Notification Preferences</span>
          </Button>
        </div>
      </form>
    {/if}
  </div>
</div>
