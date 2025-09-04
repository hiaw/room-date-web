<script lang="ts">
  interface Props {
    maxGuests: number | undefined;
    minAge: number | undefined;
    maxAge: number | undefined;
    guestGenderPreferences: string[];
    availableCredits?: number;
    onMaxGuestsChange: (value: number | undefined) => void;
    onMinAgeChange: (value: number | undefined) => void;
    onMaxAgeChange: (value: number | undefined) => void;
    onGuestGenderPreferencesChange: (preferences: string[]) => void;
    onInsufficientCredits?: (requiredCredits: number) => void;
  }

  let {
    maxGuests,
    minAge,
    maxAge,
    guestGenderPreferences,
    availableCredits,
    onMaxGuestsChange,
    onMinAgeChange,
    onMaxAgeChange,
    onGuestGenderPreferencesChange,
    onInsufficientCredits,
  }: Props = $props();

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non_binary", label: "Non-Binary" },
    { value: "any", label: "Any" },
  ];

  // Create array of guest gender preferences based on maxGuests
  let guestSlots = $derived.by(() => {
    if (!maxGuests || maxGuests <= 0) return [];

    const slots = maxGuests;
    const preferences = [...guestGenderPreferences];

    // Ensure we have enough slots - fill missing ones with "any"
    while (preferences.length < slots) {
      preferences.push("any");
    }

    // Trim excess if maxGuests was reduced
    if (preferences.length > slots) {
      preferences.splice(slots);
    }

    return preferences;
  });

  // For bulk operations when guests > 5
  let bulkGenderSelection = $state("any");

  function handleMaxGuestsChange(value: string) {
    const num = value === "" ? undefined : Number(value);

    // Check if user has sufficient credits
    if (num && availableCredits !== undefined && num > availableCredits) {
      onInsufficientCredits?.(num);
      return;
    }

    onMaxGuestsChange(num);

    // Update guest preferences array to match new size
    if (num) {
      const newPreferences = [...guestGenderPreferences];
      while (newPreferences.length < num) {
        newPreferences.push("any");
      }
      if (newPreferences.length > num) {
        newPreferences.splice(num);
      }
      onGuestGenderPreferencesChange(newPreferences);
    } else {
      // If no maxGuests, clear preferences
      onGuestGenderPreferencesChange([]);
    }
  }

  function handleGuestGenderChange(guestIndex: number, gender: string) {
    const newPreferences = [...guestGenderPreferences];
    // Ensure array is large enough
    while (newPreferences.length <= guestIndex) {
      newPreferences.push("any");
    }
    newPreferences[guestIndex] = gender;
    onGuestGenderPreferencesChange(newPreferences);
  }

  function handleBulkGenderChange(gender: string) {
    bulkGenderSelection = gender;
    if (maxGuests) {
      const newPreferences = Array(maxGuests).fill(gender);
      onGuestGenderPreferencesChange(newPreferences);
    }
  }

  function handleMinAgeChange(value: string) {
    const num = value === "" ? undefined : Number(value);
    onMinAgeChange(num);
  }

  function handleMaxAgeChange(value: string) {
    const num = value === "" ? undefined : Number(value);
    onMaxAgeChange(num);
  }
</script>

<div class="space-y-4">
  <h2 class="text-lg font-semibold text-gray-900">Guest Preferences</h2>

  <div>
    <div class="mb-1 flex items-center justify-between">
      <label for="maxGuests" class="text-sm font-medium text-gray-700">
        Maximum Guests
      </label>
      {#if availableCredits !== undefined}
        <span class="text-xs text-gray-500">
          {availableCredits}
          {availableCredits === 1 ? "credit" : "credits"} available
        </span>
      {/if}
    </div>
    <input
      id="maxGuests"
      type="number"
      value={maxGuests ?? ""}
      oninput={(e) =>
        handleMaxGuestsChange((e.target as HTMLInputElement).value)}
      min="1"
      max={availableCredits ?? 50}
      placeholder="Leave empty for no limit"
      class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
    />
    {#if availableCredits !== undefined && availableCredits === 0}
      <p class="mt-1 text-xs text-orange-600">
        You need credits to set a maximum guest limit. <a
          href="/credits"
          class="underline hover:no-underline">Buy credits</a
        > to create events.
      </p>
    {:else if availableCredits !== undefined && maxGuests && maxGuests > availableCredits}
      <p class="mt-1 text-xs text-orange-600">
        You only have {availableCredits}
        {availableCredits === 1 ? "credit" : "credits"}.
        <a href="/credits" class="underline hover:no-underline"
          >Buy more credits</a
        > to allow more guests.
      </p>
    {/if}
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="minAge" class="mb-1 block text-sm font-medium text-gray-700">
        Minimum Age
      </label>
      <input
        id="minAge"
        type="number"
        value={minAge ?? ""}
        oninput={(e) =>
          handleMinAgeChange((e.target as HTMLInputElement).value)}
        min="18"
        max="100"
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
      />
    </div>

    <div>
      <label for="maxAge" class="mb-1 block text-sm font-medium text-gray-700">
        Maximum Age
      </label>
      <input
        id="maxAge"
        type="number"
        value={maxAge ?? ""}
        oninput={(e) =>
          handleMaxAgeChange((e.target as HTMLInputElement).value)}
        min="18"
        max="100"
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
      />
    </div>
  </div>

  <fieldset>
    <legend class="mb-2 block text-sm font-medium text-gray-700">
      Gender Preferences for Each Guest
    </legend>

    {#if maxGuests && maxGuests > 0}
      {#if maxGuests > 5}
        <!-- Bulk selection for 5+ guests -->
        <div class="mb-4 rounded-lg bg-gray-50 p-3">
          <div class="mb-2 flex items-center gap-3">
            <span class="text-sm font-medium text-gray-700"
              >Apply to all {maxGuests} guests:</span
            >
          </div>
          <div class="flex flex-wrap gap-2">
            {#each genderOptions as option (option.value)}
              <button
                type="button"
                onclick={() => handleBulkGenderChange(option.value)}
                class="rounded-full border-2 px-3 py-1 text-sm transition-colors {bulkGenderSelection ===
                option.value
                  ? 'border-purple-500 bg-purple-100 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300'}"
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Individual overrides -->
        <div class="mb-3 text-sm text-gray-600">
          Or set individual preferences (optional):
        </div>
      {/if}

      <!-- Individual guest preferences -->
      <div class="max-h-64 space-y-3 overflow-y-auto">
        {#each guestSlots as guestGender, guestIndex (guestIndex)}
          <div class="flex items-center gap-3">
            <span class="min-w-16 text-sm font-medium text-gray-600">
              Guest {guestIndex + 1}:
            </span>
            <div class="flex flex-wrap gap-2">
              {#each genderOptions as option (option.value)}
                <button
                  type="button"
                  onclick={() =>
                    handleGuestGenderChange(guestIndex, option.value)}
                  class="rounded-full border-2 px-3 py-1 text-sm transition-colors {guestGender ===
                  option.value
                    ? 'border-purple-500 bg-purple-100 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-purple-300'}"
                >
                  {option.label}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-sm text-gray-500 italic">
        Set a maximum number of guests above to configure gender preferences for
        each guest slot.
      </p>
    {/if}
  </fieldset>
</div>
