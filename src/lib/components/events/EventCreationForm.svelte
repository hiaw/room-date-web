<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { goto } from "$app/navigation";
  import {
    eventCreationStore,
    modalStateStore,
  } from "$lib/stores/event-creation.js";
  import {
    validateEventCreation,
    buildEventData,
  } from "$lib/utils/event-creation-helpers.js";
  import { hasNoCredits } from "$lib/utils/credits.js";
  import type { Id } from "../../../convex/_generated/dataModel";
  import type { CreditBalance } from "$lib/utils/credits.js";
  import type { EventCreationState } from "$lib/stores/event-creation.js";
  import type { Snippet } from "svelte";

  export interface EventFormProps {
    formState: EventCreationState;
    availableCredits: number;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onImagesChange: (value: string[]) => void;
    onStartDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
    onFlexibleTimingChange: (value: boolean) => void;
    onMaxGuestsChange: (value: number | undefined) => void;
    onMinAgeChange: (value: number | undefined) => void;
    onMaxAgeChange: (value: number | undefined) => void;
    onGuestGenderPreferencesChange: (value: string[]) => void;
  }

  interface EventCreationFormProps {
    roomId: Id<"rooms">;
    creditBalance?: CreditBalance;
    onSaveStart?: () => void;
    onSaveComplete?: () => void;
    onSaveError?: (error: string) => void;
    children: Snippet<[EventFormProps]>;
  }

  let {
    roomId,
    creditBalance,
    onSaveStart,
    onSaveComplete,
    onSaveError,
    children,
  }: EventCreationFormProps = $props();

  let convex = useConvexClient();
  let availableCredits = $derived(creditBalance?.availableCredits ?? 0);

  // Subscribe to stores
  let formState = $derived($eventCreationStore);
  let modalState = $derived($modalStateStore);

  // Handle credit validation
  $effect(() => {
    // Prevent race conditions by checking if modal is already open
    if (modalState.show) return;

    if (hasNoCredits(creditBalance)) {
      modalStateStore.set({ show: true, requiredCredits: 1 });
    }
  });

  async function handleSave(event: Event) {
    event.preventDefault();

    onSaveStart?.();
    eventCreationStore.setSaving(true);

    try {
      // Validate form
      const validation = validateEventCreation(formState, availableCredits);

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        onSaveError?.(firstError);
        return;
      }

      // Check credits again before saving
      if (formState.maxGuests && formState.maxGuests > 0) {
        if (availableCredits < formState.maxGuests) {
          modalStateStore.set({
            show: true,
            requiredCredits: formState.maxGuests,
          });
          return;
        }
      }

      // Build event data and create
      const eventData = buildEventData(formState, roomId);
      await convex.mutation(api.events.createEvent, eventData);

      onSaveComplete?.();
      goto("/my-rooms");
    } catch (error) {
      console.error("Failed to create event:", error);
      onSaveError?.("Failed to create event. Please try again.");
    } finally {
      eventCreationStore.setSaving(false);
    }
  }

  function handleFieldChange<K extends keyof EventCreationState>(
    field: K,
    value: EventCreationState[K],
  ) {
    eventCreationStore.setField(field, value);
  }

  const createFieldHandler =
    <K extends keyof EventCreationState>(field: K) =>
    (value: EventCreationState[K]) =>
      handleFieldChange(field, value);

  // Initialize defaults on mount
  $effect(() => {
    eventCreationStore.initializeDefaults();
  });
</script>

<form onsubmit={handleSave} class="space-y-6">
  {@render children({
    formState,
    availableCredits,
    onTitleChange: createFieldHandler("title"),
    onDescriptionChange: createFieldHandler("description"),
    onImagesChange: createFieldHandler("eventImages"),
    onStartDateChange: createFieldHandler("startDate"),
    onStartTimeChange: createFieldHandler("startTime"),
    onEndDateChange: createFieldHandler("endDate"),
    onEndTimeChange: createFieldHandler("endTime"),
    onFlexibleTimingChange: createFieldHandler("isFlexibleTiming"),
    onMaxGuestsChange: createFieldHandler("maxGuests"),
    onMinAgeChange: createFieldHandler("minAge"),
    onMaxAgeChange: createFieldHandler("maxAge"),
    onGuestGenderPreferencesChange: createFieldHandler(
      "guestGenderPreferences",
    ),
  })}
</form>
