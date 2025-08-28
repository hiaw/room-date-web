<script lang="ts">
  import {
    discoverFilters,
    updateFilter,
  } from "$lib/stores/discover-filters.js";
  import { eventCategories } from "./types.js";

  function toggleCategory(category: string) {
    const currentCategories = $discoverFilters.selectedCategories;
    if (currentCategories.includes(category)) {
      updateFilter(
        "selectedCategories",
        currentCategories.filter((c) => c !== category),
      );
    } else {
      updateFilter("selectedCategories", [...currentCategories, category]);
    }
  }
</script>

<div class="grid grid-cols-2 gap-2">
  {#each eventCategories as category (category.value)}
    <button
      type="button"
      onclick={() => toggleCategory(category.value)}
      class="micro-bounce focus-ring flex items-center space-x-2 rounded-lg border-2 px-3 py-2 text-sm transition-all duration-200 {$discoverFilters.selectedCategories.includes(
        category.value,
      )
        ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
        : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
    >
      <span class="transition-transform duration-200">{category.emoji}</span>
      <span>{category.label}</span>
    </button>
  {/each}
</div>
