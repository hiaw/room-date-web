<script lang="ts">
  import {
    discoverFilters,
    updateFilter,
  } from "$lib/stores/discover-filters.js";
  import type { ActivityLevel } from "$lib/types/discover.js";
  import { activityLevels } from "./types.js";

  function setActivityLevel(level: string) {
    const activityLevel = level as ActivityLevel;
    updateFilter(
      "selectedActivityLevel",
      $discoverFilters.selectedActivityLevel === activityLevel
        ? null
        : activityLevel,
    );
  }
</script>

<div class="space-y-2">
  {#each activityLevels as level (level.value)}
    <button
      type="button"
      onclick={() => setActivityLevel(level.value)}
      class="micro-bounce focus-ring flex w-full items-start space-x-3 rounded-lg border-2 px-3 py-2 text-left transition-all duration-200 {$discoverFilters.selectedActivityLevel ===
      level.value
        ? 'scale-105 border-purple-500 bg-purple-100 text-purple-700'
        : 'border-gray-300 bg-white text-gray-600 hover:scale-105 hover:border-purple-300'}"
    >
      <div class="flex-1">
        <div class="font-medium">{level.label}</div>
        <div class="text-xs opacity-75">{level.description}</div>
      </div>
    </button>
  {/each}
</div>
