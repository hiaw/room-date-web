<script lang="ts">
  import { Filter } from "lucide-svelte";
  import {
    discoverFilters,
    updateFilter,
    resetFilters,
  } from "$lib/stores/discover-filters.js";

  import FilterSection from "./filters/FilterSection.svelte";
  import CategoryGrid from "./filters/CategoryGrid.svelte";
  import ActivityLevelSelector from "./filters/ActivityLevelSelector.svelte";
  import DateRangeSelector from "./filters/DateRangeSelector.svelte";
  import GenderPreferences from "./filters/GenderPreferences.svelte";
  import RangeInput from "./filters/RangeInput.svelte";
  import SortOptions from "./filters/SortOptions.svelte";
  import DistanceSlider from "./filters/DistanceSlider.svelte";

  function toggleFilter() {
    updateFilter("showFilters", !$discoverFilters.showFilters);
  }
</script>

<!-- Filter Toggle Button -->
<button
  onclick={toggleFilter}
  class="micro-bounce focus-ring rounded-xl bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200"
  aria-label="Filters"
>
  <Filter size={20} class="icon-spin" />
</button>

<!-- Filter Panel -->
{#if $discoverFilters.showFilters}
  <div
    class="animate-in slide-in-from-top-2 mt-4 space-y-6 rounded-xl border border-gray-200 bg-gray-50 p-4 duration-300"
  >
    <!-- Distance Filter -->
    <DistanceSlider />

    <!-- Event Categories -->
    <FilterSection title="Event Categories">
      <CategoryGrid />
    </FilterSection>

    <!-- Activity Level -->
    <FilterSection title="Activity Level">
      <ActivityLevelSelector />
    </FilterSection>

    <!-- Date Range -->
    <FilterSection title="When">
      <DateRangeSelector />
    </FilterSection>

    <!-- Age Range -->
    <RangeInput
      label="Age Range"
      min={18}
      max={100}
      minValue={$discoverFilters.ageRange.min}
      maxValue={$discoverFilters.ageRange.max}
      onMinChange={(value) =>
        updateFilter("ageRange", {
          ...$discoverFilters.ageRange,
          min: value,
        })}
      onMaxChange={(value) =>
        updateFilter("ageRange", {
          ...$discoverFilters.ageRange,
          max: value,
        })}
    />

    <!-- Gender Preferences -->
    <FilterSection title="Gender Preferences">
      <GenderPreferences />
    </FilterSection>

    <!-- Guest Count Filter -->
    <RangeInput
      label="Guest Count"
      min={1}
      max={50}
      minValue={$discoverFilters.guestCountRange.min}
      maxValue={$discoverFilters.guestCountRange.max}
      onMinChange={(value) =>
        updateFilter("guestCountRange", {
          ...$discoverFilters.guestCountRange,
          min: value,
        })}
      onMaxChange={(value) =>
        updateFilter("guestCountRange", {
          ...$discoverFilters.guestCountRange,
          max: value,
        })}
    />

    <!-- Sort Options -->
    <FilterSection title="Sort By">
      <SortOptions />
    </FilterSection>

    <!-- Advanced Options -->
    <div class="border-t border-gray-200 pt-4">
      <div class="flex items-center space-x-3">
        <input
          id="show-past-events"
          type="checkbox"
          checked={$discoverFilters.showPastEvents}
          onchange={(e) =>
            updateFilter("showPastEvents", e.currentTarget.checked)}
          class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <label for="show-past-events" class="text-sm text-gray-700">
          Show past events
        </label>
      </div>
    </div>

    <!-- Clear Filters -->
    <div class="border-t border-gray-200 pt-4">
      <button
        type="button"
        onclick={resetFilters}
        class="btn-hover-lift focus-ring w-full rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700 transition-all duration-200"
      >
        Clear All Filters
      </button>
    </div>
  </div>
{/if}
