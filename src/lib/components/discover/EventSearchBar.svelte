<script lang="ts">
  import { Search } from "lucide-svelte";
  import {
    discoverFilters,
    updateFilter,
  } from "$lib/stores/discover-filters.js";

  interface Props {
    placeholder?: string;
  }

  let { placeholder = "Search events, rooms, or activities..." }: Props =
    $props();

  // Debounced search to prevent excessive filtering
  let searchTimeout: ReturnType<typeof setTimeout>;
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const query = target.value;

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      updateFilter("searchQuery", query);
    }, 300); // 300ms debounce
  }
</script>

<div class="relative">
  <Search
    class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
  />
  <input
    type="text"
    {placeholder}
    value={$discoverFilters.searchQuery}
    oninput={handleInput}
    class="input-focus w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 transition-all duration-200 focus:outline-none"
  />
</div>
