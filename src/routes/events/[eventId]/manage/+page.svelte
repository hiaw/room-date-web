<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Trash2 } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EventDetailsForm from "$lib/components/events/EventDetailsForm.svelte";
  import EventTimingForm from "$lib/components/events/EventTimingForm.svelte";
  import EventGuestPreferences from "$lib/components/events/EventGuestPreferences.svelte";
  import type { Id } from "../../../../convex/_generated/dataModel";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  let eventId = $derived($page.params.eventId as Id<"events">);
  let convex = useConvexClient();

  // Fetch event data - using reactive statement to ensure it updates when eventId changes
  let eventQuery = $derived(useQuery(api.events.getEvent, { eventId }));
  let event = $derived(eventQuery?.data);
  let loading = $derived(eventQuery?.isLoading ?? true);

  // Form state - using same structure as create event for consistency
  let title = $state("");
  let description = $state("");
  let startDate = $state("");
  let startTime = $state("");
  let endDate = $state("");
  let endTime = $state("");
  let isFlexibleTiming = $state(true);
  let maxGuests = $state<number | undefined>(undefined);
  let minAge = $state<number | undefined>(18);
  let maxAge = $state<number | undefined>(undefined);
  let guestGenderPreferences = $state<string[]>([]);

  // State
  let saving = $state(false);
  let deleting = $state(false);
  let formErrors = $state<Record<string, string>>({});

  // Calculate today's date for min date constraints
  let todayDateString = $derived(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Initialize form data when event loads
  $effect(() => {
    if (event) {
      title = event.title || "";
      description = event.description || "";
      isFlexibleTiming = event.isFlexibleTiming ?? true;
      maxGuests = event.maxGuests;
      minAge = event.minAge ?? 18;
      maxAge = event.maxAge;
      guestGenderPreferences = event.guestGenderPreferences || [];

      if (event.startTime) {
        const startDateTime = new Date(event.startTime);
        startDate = startDateTime.toISOString().split("T")[0];
        startTime = startDateTime.toTimeString().slice(0, 5);
      }
      if (event.endTime) {
        const endDateTime = new Date(event.endTime);
        endDate = endDateTime.toISOString().split("T")[0];
        endTime = endDateTime.toTimeString().slice(0, 5);
      }
    }
  });

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!title?.trim()) {
      errors.title = "Title is required";
    }

    if (!isFlexibleTiming) {
      if (!startDate || !startTime) {
        errors.timing = "Start date and time are required for scheduled events";
      }

      if (startDate && startTime && endDate && endTime) {
        const startDateTime = new Date(`${startDate}T${startTime}`).getTime();
        const endDateTime = new Date(`${endDate}T${endTime}`).getTime();
        if (endDateTime <= startDateTime) {
          errors.timing = "End time must be after start time";
        }
      }
    }

    if (maxGuests !== undefined && maxGuests < 1) {
      errors.maxGuests = "Maximum guests must be at least 1";
    }

    if (minAge !== undefined && minAge < 18) {
      errors.minAge = "Minimum age must be at least 18";
    }

    if (maxAge !== undefined && minAge !== undefined && maxAge < minAge) {
      errors.maxAge = "Maximum age must be greater than minimum age";
    }

    formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  async function handleSave(event: SubmitEvent) {
    event.preventDefault();
    if (!validateForm()) return;

    saving = true;
    try {
      let startTimestamp: number | undefined;
      let endTimestamp: number | undefined;

      if (!isFlexibleTiming && startDate && startTime) {
        startTimestamp = new Date(`${startDate}T${startTime}`).getTime();

        if (endDate && endTime) {
          endTimestamp = new Date(`${endDate}T${endTime}`).getTime();
        }
      }

      await convex.mutation(api.events.updateEvent, {
        eventId,
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: isFlexibleTiming ? undefined : startTimestamp,
        endTime: isFlexibleTiming ? undefined : endTimestamp,
        isFlexibleTiming,
        maxGuests,
        minAge,
        maxAge,
        guestGenderPreferences:
          guestGenderPreferences.length > 0
            ? guestGenderPreferences
            : undefined,
      });

      goto(`/events/${eventId}`);
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    ) {
      return;
    }

    deleting = true;
    try {
      await convex.mutation(api.events.deleteEvent, { eventId });
      goto("/my-rooms");
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      deleting = false;
    }
  }

  function handleBack() {
    goto(`/events/${eventId}`);
  }

  // Event handlers for form components (matching create event pattern)
  function handleTitleChange(value: string) {
    title = value;
  }

  function handleDescriptionChange(value: string) {
    description = value;
  }

  function handleStartDateChange(value: string) {
    startDate = value;
  }

  function handleStartTimeChange(value: string) {
    startTime = value;
  }

  function handleEndDateChange(value: string) {
    endDate = value;
  }

  function handleEndTimeChange(value: string) {
    endTime = value;
  }

  function handleFlexibleTimingChange(value: boolean) {
    isFlexibleTiming = value;
  }

  function handleMaxGuestsChange(value: number | undefined) {
    maxGuests = value;
  }

  function handleMinAgeChange(value: number | undefined) {
    minAge = value;
  }

  function handleMaxAgeChange(value: number | undefined) {
    maxAge = value;
  }

  function handleGuestGenderPreferencesChange(preferences: string[]) {
    guestGenderPreferences = preferences;
  }
</script>

<svelte:head>
  <title>Manage Event - Room Dates</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <button
          onclick={handleBack}
          class="rounded-xl bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 class="text-xl font-bold text-gray-900">Manage Event</h1>
        <div class="w-10"></div>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else if !event}
    <div class="px-4 py-16 text-center">
      <h2 class="text-xl font-semibold text-gray-900">Event not found</h2>
      <p class="mt-2 text-gray-600">
        The event you're looking for doesn't exist or has been deleted.
      </p>
      <Button onclick={() => goto("/my-rooms")} class="mt-4">
        Back to My Rooms
      </Button>
    </div>
  {:else}
    <div class="mx-auto max-w-2xl px-4 py-6">
      <form onsubmit={handleSave} class="space-y-6">
        <!-- Event Details -->
        <div
          class="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
        >
          <EventDetailsForm
            {title}
            {description}
            onTitleChange={handleTitleChange}
            onDescriptionChange={handleDescriptionChange}
          />
          {#if formErrors.title}
            <p class="mt-2 text-sm text-red-600">{formErrors.title}</p>
          {/if}
        </div>

        <!-- Timing -->
        <div
          class="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
        >
          <EventTimingForm
            {startDate}
            {startTime}
            {endDate}
            {endTime}
            {isFlexibleTiming}
            todayDateString={todayDateString()}
            onStartDateChange={handleStartDateChange}
            onStartTimeChange={handleStartTimeChange}
            onEndDateChange={handleEndDateChange}
            onEndTimeChange={handleEndTimeChange}
            onFlexibleTimingChange={handleFlexibleTimingChange}
          />
          {#if formErrors.timing}
            <p class="mt-2 text-sm text-red-600">{formErrors.timing}</p>
          {/if}
        </div>

        <!-- Guest Preferences -->
        <div
          class="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
        >
          <EventGuestPreferences
            {maxGuests}
            {minAge}
            {maxAge}
            {guestGenderPreferences}
            onMaxGuestsChange={handleMaxGuestsChange}
            onMinAgeChange={handleMinAgeChange}
            onMaxAgeChange={handleMaxAgeChange}
            onGuestGenderPreferencesChange={handleGuestGenderPreferencesChange}
          />
          {#if formErrors.maxGuests || formErrors.minAge || formErrors.maxAge}
            <div class="mt-2 space-y-1">
              {#if formErrors.maxGuests}
                <p class="text-sm text-red-600">{formErrors.maxGuests}</p>
              {/if}
              {#if formErrors.minAge}
                <p class="text-sm text-red-600">{formErrors.minAge}</p>
              {/if}
              {#if formErrors.maxAge}
                <p class="text-sm text-red-600">{formErrors.maxAge}</p>
              {/if}
            </div>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col space-y-3">
          <Button type="submit" disabled={saving} class="w-full">
            {#if saving}
              <div
                class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
            {/if}
            Save Changes
          </Button>

          <Button
            type="button"
            variant="danger"
            onclick={handleDelete}
            disabled={deleting}
            class="w-full"
          >
            {#if deleting}
              <div
                class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
            {:else}
              <Trash2 size={16} class="mr-2" />
            {/if}
            Delete Event
          </Button>
        </div>
      </form>
    </div>
  {/if}
</div>
