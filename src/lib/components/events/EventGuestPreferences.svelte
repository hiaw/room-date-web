<script lang="ts">
  interface Props {
    maxGuests: number | undefined;
    minAge: number | undefined;
    maxAge: number | undefined;
    preferredGender: string[];
    onMaxGuestsChange: (value: number | undefined) => void;
    onMinAgeChange: (value: number | undefined) => void;
    onMaxAgeChange: (value: number | undefined) => void;
    onGenderToggle: (gender: string) => void;
  }

  let {
    maxGuests,
    minAge,
    maxAge,
    preferredGender,
    onMaxGuestsChange,
    onMinAgeChange,
    onMaxAgeChange,
    onGenderToggle,
  }: Props = $props();

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non_binary", label: "Non-Binary" },
    { value: "any", label: "Any" },
  ];

  function handleMaxGuestsChange(value: string) {
    const num = value === "" ? undefined : Number(value);
    onMaxGuestsChange(num);
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
    <label for="maxGuests" class="mb-1 block text-sm font-medium text-gray-700">
      Maximum Guests
    </label>
    <input
      id="maxGuests"
      type="number"
      value={maxGuests ?? ""}
      oninput={(e) =>
        handleMaxGuestsChange((e.target as HTMLInputElement).value)}
      min="1"
      max="50"
      placeholder="Leave empty for no limit"
      class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
    />
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
      Gender Preferences
    </legend>
    <div class="flex flex-wrap gap-2">
      {#each genderOptions as option (option.value)}
        <button
          type="button"
          onclick={() => onGenderToggle(option.value)}
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
  </fieldset>
</div>
