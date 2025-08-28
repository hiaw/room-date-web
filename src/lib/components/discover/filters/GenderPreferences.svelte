<script lang="ts">
  import {
    discoverFilters,
    updateFilter,
  } from "$lib/stores/discover-filters.js";

  const genderOptions = ["male", "female", "non_binary", "any"];

  function toggleGender(gender: string) {
    const currentGenders = $discoverFilters.selectedGenders;
    if (currentGenders.includes(gender)) {
      updateFilter(
        "selectedGenders",
        currentGenders.filter((g) => g !== gender),
      );
    } else {
      updateFilter("selectedGenders", [...currentGenders, gender]);
    }
  }
</script>

<div class="flex flex-wrap gap-2">
  {#each genderOptions as gender (gender)}
    <button
      type="button"
      onclick={() => toggleGender(gender)}
      class="micro-bounce focus-ring rounded-full border-2 px-3 py-1 text-sm transition-all duration-200 {$discoverFilters.selectedGenders.includes(
        gender,
      )
        ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
        : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
    >
      {gender.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </button>
  {/each}
</div>
