<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { ArrowLeft, Save } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import EventRoomContext from "$lib/components/events/EventRoomContext.svelte";
  import EventImageSection from "$lib/components/events/EventImageSection.svelte";
  import EventDetailsForm from "$lib/components/events/EventDetailsForm.svelte";
  import EventTimingForm from "$lib/components/events/EventTimingForm.svelte";
  import EventGuestPreferences from "$lib/components/events/EventGuestPreferences.svelte";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roomId = $page.params.roomId as any;

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Fetch room details
  let roomQuery = useQuery(api.rooms.getRoom, { roomId });
  let room = $derived(roomQuery?.data);
  let roomLoading = $derived(roomQuery?.isLoading ?? true);

  // Create event mutation
  let convex = useConvexClient();

  // Form state
  let title = $state("");
  let description = $state("");
  let startDate = $state("");
  let startTime = $state("");
  let endDate = $state("");
  let endTime = $state("");
  let isFlexibleTiming = $state(false);
  let maxGuests = $state<number | undefined>(undefined);
  let minAge = $state<number | undefined>(18);
  let maxAge = $state<number | undefined>(65);
  let guestGenderPreferences = $state<string[]>([]);
  let saving = $state(false);
  let eventImages: string[] = $state([]);

  // Calculate today's date for min date constraints
  let todayDateString = $derived(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  async function handleSave(event: Event) {
    event.preventDefault();

    if (!room) return;

    if (!title.trim()) {
      alert("Please enter an event title");
      return;
    }

    // Validation
    if (!title.trim()) {
      alert("Please enter an event title");
      return;
    }

    if (title.trim().length < 3) {
      alert("Event title must be at least 3 characters long");
      return;
    }

    if (!description.trim()) {
      alert("Please enter an event description");
      return;
    }

    if (description.trim().length < 10) {
      alert("Event description must be at least 10 characters long");
      return;
    }

    if (!isFlexibleTiming && (!startDate || !startTime)) {
      alert("Please set a start date and time");
      return;
    }

    // Validate guest count
    if (maxGuests && (maxGuests < 1 || maxGuests > 50)) {
      alert("Maximum guests must be between 1 and 50");
      return;
    }

    // Validate age range
    if (minAge && maxAge && minAge > maxAge) {
      alert("Minimum age cannot be greater than maximum age");
      return;
    }

    if (minAge && (minAge < 18 || minAge > 100)) {
      alert("Minimum age must be between 18 and 100");
      return;
    }

    if (maxAge && (maxAge < 18 || maxAge > 100)) {
      alert("Maximum age must be between 18 and 100");
      return;
    }

    saving = true;

    try {
      let startTimestamp: number | undefined;
      let endTimestamp: number | undefined;

      if (!isFlexibleTiming) {
        startTimestamp = new Date(`${startDate}T${startTime}`).getTime();

        if (endDate && endTime) {
          endTimestamp = new Date(`${endDate}T${endTime}`).getTime();

          if (endTimestamp <= startTimestamp) {
            alert("End time must be after start time");
            saving = false;
            return;
          }
        }
      }

      const eventData = {
        roomId,
        title: title.trim(),
        description: description.trim() || undefined,
        startTime: startTimestamp,
        endTime: endTimestamp,
        isFlexibleTiming,
        maxGuests,
        guestGenderPreferences:
          guestGenderPreferences.length > 0
            ? guestGenderPreferences
            : undefined,
        minAge,
        maxAge,
        eventImages,
        primaryEventImageUrl: eventImages[0] || undefined,
      };

      await convex.mutation(api.events.createEvent, eventData);
      goto("/my-rooms");
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      saving = false;
    }
  }

  function handleBack() {
    goto("/my-rooms");
  }

  function handleGuestGenderPreferencesChange(preferences: string[]) {
    guestGenderPreferences = preferences;
  }

  // Event handlers for form components
  function handleTitleChange(value: string) {
    title = value;
  }

  function handleDescriptionChange(value: string) {
    description = value;
  }

  function handleImagesChange(images: string[]) {
    eventImages = images;
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

  // Set default dates (today and tomorrow)
  onMount(() => {
    const now = Date.now();
    const today = new Date(now);
    const tomorrow = new Date(now + 24 * 60 * 60 * 1000);

    startDate = today.toISOString().split("T")[0];
    startTime = "19:00"; // Default to 7 PM
    endDate = tomorrow.toISOString().split("T")[0];
    endTime = "22:00"; // Default to 10 PM
  });
</script>

<svelte:head>
  <title>Create Event - Room Dates</title>
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
        <h1 class="text-xl font-bold text-gray-900">Create Event</h1>
        <button
          onclick={handleSave}
          disabled={saving || !title.trim() || roomLoading}
          class="flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {#if saving}
            <div
              class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
          {:else}
            <Save size={16} />
          {/if}
          <span>Create</span>
        </button>
      </div>
    </div>
  </div>

  {#if roomLoading}
    <div class="flex items-center justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else if !room}
    <div class="flex flex-col items-center justify-center py-16">
      <p class="text-gray-600">Room not found</p>
      <Button onclick={() => goto("/my-rooms")} class="mt-4"
        >Back to My Rooms</Button
      >
    </div>
  {:else}
    <div class="mx-auto max-w-2xl px-4 py-6">
      <!-- Room Context -->
      <EventRoomContext {room} />

      <form onsubmit={handleSave} class="space-y-6">
        <!-- Event Photos -->
        <EventImageSection {eventImages} onImagesChange={handleImagesChange} />

        <!-- Event Details -->
        <EventDetailsForm
          {title}
          {description}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
        />

        <!-- Timing -->
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

        <!-- Guest Preferences -->
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

        <!-- Submit Button (Mobile) -->
        <div class="pt-6 lg:hidden">
          <Button
            onclick={() => handleSave(new Event("click"))}
            disabled={saving || !title.trim()}
            class="w-full"
          >
            {#if saving}
              <div
                class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
            {/if}
            Create Event
          </Button>
        </div>
      </form>
    </div>
  {/if}
</div>
