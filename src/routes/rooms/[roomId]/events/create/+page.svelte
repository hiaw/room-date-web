<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery } from "convex-svelte";
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
  import EventCreationForm, {
    type EventFormProps,
  } from "$lib/components/events/EventCreationForm.svelte";
  import CreditWarning from "$lib/components/events/CreditWarning.svelte";
  import InsufficientCreditsModal from "$lib/components/credits/InsufficientCreditsModal.svelte";
  import {
    eventCreationStore,
    modalStateStore,
  } from "$lib/stores/event-creation.js";
  import { hasNoCredits } from "$lib/utils/credits.js";
  import type { Id } from "../../../../../convex/_generated/dataModel";
  import type { CreditBalance } from "$lib/utils/credits.js";

  const roomId = $page.params.roomId as Id<"rooms">;

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

  // Fetch user's credit balance
  let creditQuery = useQuery(api.credits.getCreditBalance, {});
  let creditBalance = $derived(creditQuery?.data as CreditBalance | undefined);
  let creditError = $derived(creditQuery?.error);
  let creditLoading = $derived(creditQuery?.isLoading ?? true);
  let availableCredits = $derived(creditBalance?.availableCredits ?? 0);

  // Subscribe to stores
  let formState = $eventCreationStore;
  let modalState = $modalStateStore;

  // Calculate today's date for min date constraints
  let todayDateString = $derived(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  // Error state for form submission - removed unused variable

  function handleBack() {
    goto("/my-rooms");
  }

  function handleSaveStart() {
    // Can add any pre-save logic here if needed
  }

  function handleSaveError(error: string) {
    alert(error);
  }

  function handleInsufficientCreditsCancel() {
    if (hasNoCredits(creditBalance)) {
      goto("/my-rooms");
    } else {
      modalStateStore.set({ show: false, requiredCredits: 0 });
    }
  }

  function handleInsufficientCredits(requiredCredits: number) {
    modalStateStore.set({ show: true, requiredCredits });
  }
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
          onclick={() => {
            const formElement = document.querySelector("form");
            if (formElement) {
              formElement.requestSubmit();
            }
          }}
          disabled={formState.saving || !formState.title.trim() || roomLoading}
          class="flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {#if formState.saving}
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

  {#if roomLoading || creditLoading}
    <div class="flex items-center justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else if creditError}
    <div class="flex flex-col items-center justify-center py-16">
      <p class="mb-4 text-red-600">Failed to load credit information</p>
      <Button onclick={() => location.reload()} class="mt-4">Retry</Button>
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

      <EventCreationForm
        {roomId}
        {creditBalance}
        onSaveStart={handleSaveStart}
        onSaveError={handleSaveError}
      >
        {#snippet children(props: EventFormProps)}
          <!-- Credit Warning -->
          <CreditWarning {creditBalance} />

          <!-- Event Photos -->
          <EventImageSection
            eventImages={props.formState.eventImages}
            onImagesChange={props.onImagesChange}
          />

          <!-- Event Details -->
          <EventDetailsForm
            title={props.formState.title}
            description={props.formState.description}
            onTitleChange={props.onTitleChange}
            onDescriptionChange={props.onDescriptionChange}
          />

          <!-- Timing -->
          <EventTimingForm
            startDate={props.formState.startDate}
            startTime={props.formState.startTime}
            endDate={props.formState.endDate}
            endTime={props.formState.endTime}
            isFlexibleTiming={props.formState.isFlexibleTiming}
            todayDateString={todayDateString()}
            onStartDateChange={props.onStartDateChange}
            onStartTimeChange={props.onStartTimeChange}
            onEndDateChange={props.onEndDateChange}
            onEndTimeChange={props.onEndTimeChange}
            onFlexibleTimingChange={props.onFlexibleTimingChange}
          />

          <!-- Guest Preferences -->
          <EventGuestPreferences
            maxGuests={props.formState.maxGuests}
            minAge={props.formState.minAge}
            maxAge={props.formState.maxAge}
            guestGenderPreferences={props.formState.guestGenderPreferences}
            availableCredits={props.availableCredits}
            onMaxGuestsChange={props.onMaxGuestsChange}
            onMinAgeChange={props.onMinAgeChange}
            onMaxAgeChange={props.onMaxAgeChange}
            onGuestGenderPreferencesChange={props.onGuestGenderPreferencesChange}
            onInsufficientCredits={handleInsufficientCredits}
          />

          <!-- Submit Button (Mobile) -->
          <div class="pt-6 lg:hidden">
            <Button
              type="submit"
              disabled={props.formState.saving || !props.formState.title.trim()}
              class="w-full"
            >
              {#if props.formState.saving}
                <div
                  class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
              {/if}
              Create Event
            </Button>
          </div>
        {/snippet}
      </EventCreationForm>
    </div>
  {/if}
</div>

<InsufficientCreditsModal
  open={modalState.show}
  {availableCredits}
  requiredCredits={modalState.requiredCredits}
  onClose={() => modalStateStore.set({ show: false, requiredCredits: 0 })}
  onCancel={handleInsufficientCreditsCancel}
/>
