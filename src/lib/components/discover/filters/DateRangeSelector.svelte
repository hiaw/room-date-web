<script lang="ts">
  import {
    discoverFilters,
    updateFilter,
  } from "$lib/stores/discover-filters.js";
  import { dateRangeOptions } from "./types.js";
</script>

<div class="grid grid-cols-2 gap-2">
  {#each dateRangeOptions as option (option.value)}
    <button
      type="button"
      onclick={() => updateFilter("selectedDateRange", option.value)}
      class="micro-bounce focus-ring rounded-lg border-2 px-3 py-2 text-sm transition-all duration-200 {$discoverFilters.selectedDateRange ===
      option.value
        ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
        : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
    >
      {option.label}
    </button>
  {/each}
</div>
