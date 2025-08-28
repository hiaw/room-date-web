<script lang="ts">
  import {
    discoverFilters,
    updateFilter,
  } from "$lib/stores/discover-filters.js";
</script>

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
