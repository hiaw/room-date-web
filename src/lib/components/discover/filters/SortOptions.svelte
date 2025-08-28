<script lang="ts">
  import {
    discoverFilters,
    updateFilter,
  } from "$lib/stores/discover-filters.js";
  import { sortOptions } from "./types.js";
</script>

<div class="space-y-2">
  {#each sortOptions as option (option.value)}
    <div class="flex items-center justify-between">
      <button
        type="button"
        onclick={() => updateFilter("sortBy", option.value)}
        class="micro-bounce focus-ring flex-1 rounded-lg border-2 px-3 py-2 text-left text-sm transition-all duration-200 {$discoverFilters.sortBy ===
        option.value
          ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
          : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
      >
        {option.label}
      </button>
      {#if $discoverFilters.sortBy === option.value}
        <button
          type="button"
          onclick={() =>
            updateFilter(
              "sortOrder",
              $discoverFilters.sortOrder === "asc" ? "desc" : "asc",
            )}
          class="ml-2 cursor-pointer rounded border-none bg-transparent px-2 py-1 text-xs hover:text-purple-800"
          aria-label="Toggle sort order"
        >
          {$discoverFilters.sortOrder === "asc" ? "↑" : "↓"}
        </button>
      {/if}
    </div>
  {/each}
</div>
