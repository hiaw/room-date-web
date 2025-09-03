<script lang="ts">
  import { Search } from "lucide-svelte";
  import type { ConnectionsSearchProps } from "$lib/types/domains/connections.js";

  let { searchQuery, onSearchChange, connectionCount }: ConnectionsSearchProps =
    $props();
</script>

<!-- Search -->
{#if connectionCount > 0}
  <div class="relative mb-4">
    <Search
      class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
    />
    <input
      type="text"
      bind:value={searchQuery}
      oninput={(e) => onSearchChange(e.currentTarget.value)}
      placeholder="Search connections, notes, or tags..."
      class="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
    />
  </div>
{/if}
