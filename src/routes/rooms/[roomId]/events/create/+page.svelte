<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useMutation } from "convex-svelte";
  import { api } from "../../../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { ArrowLeft, Save } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import ImageUploader from "$lib/components/ui/ImageUploader.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  const roomId = $page.params.roomId;

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
  let createEvent = useMutation(api.events.createEvent);

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
  let preferredGender = $state<string[]>(["any"]);
  let saving = $state(false);

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
    lastSubmissionTime = Date.now();

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
        preferredGender:
          preferredGender.length > 0 ? preferredGender : undefined,
        minAge,
        maxAge,
        eventImages,
        primaryEventImageUrl: eventImages[0] || undefined,
        isActive: true,
      };

      await createEvent(eventData);
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

  function toggleGender(gender: string) {
    if (preferredGender.includes(gender)) {
      preferredGender = preferredGender.filter((g) => g !== gender);
    } else {
      preferredGender = [...preferredGender, gender];
    }
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
      <div
        class="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div class="flex items-center space-x-3">
          {#if room.primaryImageUrl}
            <img
              src={room.primaryImageUrl}
              alt={room.title}
              class="h-12 w-12 rounded-lg object-cover"
            />
          {:else}
            <div
              class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100"
            >
              <span class="font-medium text-purple-600"
                >{room.title.charAt(0)}</span
              >
            </div>
          {/if}
          <div>
            <h3 class="font-medium text-gray-900">{room.title}</h3>
            <p class="text-sm text-gray-600">{room.city}, {room.state}</p>
          </div>
        </div>
      </div>

      <form onsubmit={handleSave} class="space-y-6">
        <!-- Event Photos -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Event Photos</h2>
          <p class="text-sm text-gray-600">
            Add photos that capture the vibe of your event. These can be
            different from room photos.
          </p>
          <ImageUploader
            images={eventImages}
            maxImages={6}
            onImagesChange={(newImages) => (eventImages = newImages)}
            label="Add Event Photos"
          />
        </div>

        <!-- Basic Information -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Event Details</h2>

          <div>
            <label
              for="title"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Event Title *
            </label>
            <input
              id="title"
              type="text"
              bind:value={title}
              placeholder="e.g. Wine & Paint Night, Game Night, Dinner Party"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              for="description"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              bind:value={description}
              placeholder="What's the event about? What should people expect? What should they bring?"
              rows="4"
              class="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <!-- Timing -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Timing</h2>

          <div class="flex items-center space-x-3">
            <input
              id="flexible-timing"
              type="checkbox"
              bind:checked={isFlexibleTiming}
              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label for="flexible-timing" class="text-sm text-gray-700">
              Flexible timing (guests can suggest times)
            </label>
          </div>

          {#if !isFlexibleTiming}
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="startDate"
                  class="mb-1 block text-sm font-medium text-gray-700"
                >
                  Start Date *
                </label>
                <input
                  id="startDate"
                  type="date"
                  bind:value={startDate}
                  min={todayDateString}
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  required={!isFlexibleTiming}
                />
              </div>

              <div>
                <label
                  for="startTime"
                  class="mb-1 block text-sm font-medium text-gray-700"
                >
                  Start Time *
                </label>
                <input
                  id="startTime"
                  type="time"
                  bind:value={startTime}
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                  required={!isFlexibleTiming}
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label
                  for="endDate"
                  class="mb-1 block text-sm font-medium text-gray-700"
                >
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  bind:value={endDate}
                  min={startDate || todayDateString}
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>

              <div>
                <label
                  for="endTime"
                  class="mb-1 block text-sm font-medium text-gray-700"
                >
                  End Time
                </label>
                <input
                  id="endTime"
                  type="time"
                  bind:value={endTime}
                  class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>
            </div>
          {/if}
        </div>

        <!-- Guest Preferences -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Guest Preferences</h2>

          <div>
            <label
              for="maxGuests"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Maximum Guests
            </label>
            <input
              id="maxGuests"
              type="number"
              bind:value={maxGuests}
              min="1"
              max="50"
              placeholder="Leave empty for no limit"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="minAge"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                Minimum Age
              </label>
              <input
                id="minAge"
                type="number"
                bind:value={minAge}
                min="18"
                max="100"
                class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>

            <div>
              <label
                for="maxAge"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                Maximum Age
              </label>
              <input
                id="maxAge"
                type="number"
                bind:value={maxAge}
                min="18"
                max="100"
                class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-gray-700">
              Gender Preferences
            </label>
            <div class="flex flex-wrap gap-2">
              {#each [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "non_binary", label: "Non-Binary" }, { value: "any", label: "Any" }] as option (option.value)}
                <button
                  type="button"
                  onclick={() => toggleGender(option.value)}
                  class="rounded-full border-2 px-4 py-2 text-sm transition-colors {preferredGender.includes(
                    option.value,
                  )
                    ? 'border-purple-500 bg-purple-100 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300'}"
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <!-- Submit Button (Mobile) -->
        <div class="pt-6 lg:hidden">
          <Button
            onclick={handleSave}
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
