<script lang="ts">
  import { Heart } from "lucide-svelte";

  interface Props {
    ageRangeMin: number;
    ageRangeMax: number;
    maxDistance: number;
    genderPreferences: string[];
    onAgeRangeMinChange: (value: number) => void;
    onAgeRangeMaxChange: (value: number) => void;
    onMaxDistanceChange: (value: number) => void;
    onGenderToggle: (gender: string) => void;
  }

  let {
    ageRangeMin,
    ageRangeMax,
    maxDistance,
    genderPreferences,
    onAgeRangeMinChange,
    onAgeRangeMaxChange,
    onMaxDistanceChange,
    onGenderToggle,
  }: Props = $props();

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "non_binary", label: "Non-binary" },
    { value: "other", label: "Other" },
  ];
</script>

<div
  class="rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
>
  <div class="border-b border-gray-100 px-8 py-6">
    <h3 class="flex items-center space-x-2 text-lg font-semibold text-gray-900">
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
        Show events for people between {ageRangeMin} and {ageRangeMax} years old
      </p>
      <div class="space-y-4">
        <div>
          <label for="age-range-min" class="block text-sm text-gray-700">
            Minimum Age: {ageRangeMin}
          </label>
          <input
            id="age-range-min"
            type="range"
            min="18"
            max="100"
            value={ageRangeMin}
            oninput={(e) =>
              onAgeRangeMinChange(Number((e.target as HTMLInputElement).value))}
            class="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            style="background-image: linear-gradient(to right, rgb(147 51 234), rgb(147 51 234));"
          />
        </div>
        <div>
          <label for="age-range-max" class="block text-sm text-gray-700">
            Maximum Age: {ageRangeMax}
          </label>
          <input
            id="age-range-max"
            type="range"
            min="18"
            max="100"
            value={ageRangeMax}
            oninput={(e) =>
              onAgeRangeMaxChange(Number((e.target as HTMLInputElement).value))}
            class="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            style="background-image: linear-gradient(to right, rgb(147 51 234), rgb(147 51 234));"
          />
        </div>
      </div>
    </div>

    <!-- Distance -->
    <div>
      <label for="max-distance" class="block font-medium text-gray-900">
        Maximum Distance
      </label>
      <p class="mb-4 text-sm text-gray-600">
        Show events within {maxDistance} miles from your location
      </p>
      <input
        id="max-distance"
        type="range"
        min="5"
        max="100"
        value={maxDistance}
        oninput={(e) =>
          onMaxDistanceChange(Number((e.target as HTMLInputElement).value))}
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
      <legend class="block font-medium text-gray-900">Gender Preferences</legend
      >
      <p class="mb-4 text-sm text-gray-600">
        Show events from people of these genders (leave empty for all)
      </p>
      <div class="grid grid-cols-2 gap-3">
        {#each genderOptions as option (option.value)}
          <button
            type="button"
            onclick={() => onGenderToggle(option.value)}
            class={`rounded-xl px-4 py-3 text-left transition-colors ${
              genderPreferences.includes(option.value)
                ? "bg-purple-100 text-purple-700 ring-2 ring-purple-600"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </fieldset>
  </div>
</div>
