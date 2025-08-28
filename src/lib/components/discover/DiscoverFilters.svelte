<script lang="ts">
  import { Filter } from "lucide-svelte";
  import {
    discoverFilters,
    updateFilter,
    resetFilters,
  } from "$lib/stores/discover-filters.js";

  interface EventCategory {
    value: string;
    label: string;
    emoji: string;
  }

  interface ActivityLevelOption {
    value: string;
    label: string;
    description: string;
  }

  type DateRange = "any" | "today" | "this_week" | "this_month";
  type ActivityLevel = "low" | "medium" | "high" | null;
  type SortBy = "distance" | "date" | "popularity" | "newest";

  // Event categories
  const eventCategories: EventCategory[] = [
    { value: "social", label: "Social", emoji: "🎉" },
    { value: "dining", label: "Dining", emoji: "🍽️" },
    { value: "games", label: "Games", emoji: "🎮" },
    { value: "arts", label: "Arts & Culture", emoji: "🎨" },
    { value: "fitness", label: "Fitness", emoji: "💪" },
    { value: "professional", label: "Networking", emoji: "💼" },
    { value: "outdoor", label: "Outdoor", emoji: "🌿" },
    { value: "music", label: "Music", emoji: "🎵" },
  ];

  const activityLevels: ActivityLevelOption[] = [
    {
      value: "low",
      label: "Chill",
      description: "Relaxed, low-key activities",
    },
    { value: "medium", label: "Active", description: "Moderate engagement" },
    {
      value: "high",
      label: "High Energy",
      description: "Active, energetic events",
    },
  ];

  function toggleFilter() {
    updateFilter("showFilters", !$discoverFilters.showFilters);
  }

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
    <div>
      <label
        for="distance-slider"
        class="mb-2 block text-sm font-medium text-gray-700"
      >
        Distance: {$discoverFilters.maxDistance} miles
      </label>
      <input
        id="distance-slider"
        type="range"
        min="1"
        max="50"
        value={$discoverFilters.maxDistance}
        oninput={(e) =>
          updateFilter("maxDistance", parseInt(e.currentTarget.value))}
        class="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
      />
    </div>

    <!-- Event Categories -->
    <div>
      <span class="mb-3 block text-sm font-medium text-gray-700">
        Event Categories
      </span>
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
            <span class="transition-transform duration-200"
              >{category.emoji}</span
            >
            <span>{category.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Activity Level -->
    <div>
      <span class="mb-3 block text-sm font-medium text-gray-700">
        Activity Level
      </span>
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
    </div>

    <!-- Date Range -->
    <div>
      <span class="mb-3 block text-sm font-medium text-gray-700">When</span>
      <div class="grid grid-cols-2 gap-2">
        {#each [{ value: "any" as DateRange, label: "Anytime" }, { value: "today" as DateRange, label: "Today" }, { value: "this_week" as DateRange, label: "This Week" }, { value: "this_month" as DateRange, label: "This Month" }] as option (option.value)}
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
    </div>

    <!-- Age Range -->
    <div>
      <span class="mb-2 block text-sm font-medium text-gray-700">
        Age Range: {$discoverFilters.ageRange.min} - {$discoverFilters.ageRange
          .max}
      </span>
      <div class="flex items-center space-x-4">
        <input
          type="number"
          min="18"
          max="100"
          value={$discoverFilters.ageRange.min}
          oninput={(e) =>
            updateFilter("ageRange", {
              ...$discoverFilters.ageRange,
              min: parseInt(e.currentTarget.value),
            })}
          class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
          placeholder="Min"
          aria-label="Minimum age"
        />
        <span class="text-gray-500">to</span>
        <input
          type="number"
          min="18"
          max="100"
          value={$discoverFilters.ageRange.max}
          oninput={(e) =>
            updateFilter("ageRange", {
              ...$discoverFilters.ageRange,
              max: parseInt(e.currentTarget.value),
            })}
          class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
          placeholder="Max"
          aria-label="Maximum age"
        />
      </div>
    </div>

    <!-- Gender Preferences -->
    <div>
      <span class="mb-2 block text-sm font-medium text-gray-700"
        >Gender Preferences</span
      >
      <div class="flex flex-wrap gap-2">
        {#each ["male", "female", "non_binary", "any"] as gender (gender)}
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
    </div>

    <!-- Guest Count Filter -->
    <div>
      <span class="mb-2 block text-sm font-medium text-gray-700">
        Guest Count: {$discoverFilters.guestCountRange.min} - {$discoverFilters
          .guestCountRange.max}
      </span>
      <div class="flex items-center space-x-4">
        <input
          type="number"
          min="1"
          max="50"
          value={$discoverFilters.guestCountRange.min}
          oninput={(e) =>
            updateFilter("guestCountRange", {
              ...$discoverFilters.guestCountRange,
              min: parseInt(e.currentTarget.value),
            })}
          class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
          placeholder="Min"
          aria-label="Minimum guest count"
        />
        <span class="text-gray-500">to</span>
        <input
          type="number"
          min="1"
          max="50"
          value={$discoverFilters.guestCountRange.max}
          oninput={(e) =>
            updateFilter("guestCountRange", {
              ...$discoverFilters.guestCountRange,
              max: parseInt(e.currentTarget.value),
            })}
          class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
          placeholder="Max"
          aria-label="Maximum guest count"
        />
      </div>
    </div>

    <!-- Sort Options -->
    <div>
      <span class="mb-3 block text-sm font-medium text-gray-700">Sort By</span>
      <div class="space-y-2">
        {#each [{ value: "distance" as SortBy, label: "Distance" }, { value: "date" as SortBy, label: "Date" }, { value: "popularity" as SortBy, label: "Popularity" }, { value: "newest" as SortBy, label: "Newest First" }] as option (option.value)}
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
    </div>

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

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    border: none;
  }
</style>
