<script lang="ts">
  import { User, Search } from "lucide-svelte";
  import LoadingSpinner from "../ui/LoadingSpinner.svelte";
  import ConnectionItem from "./ConnectionItem.svelte";
  import type { ConnectionsListProps } from "$lib/types/domains/connections.js";

  let {
    connections,
    loading,
    searchQuery,
    onEdit,
    onMessage,
    onDiscoverClick,
  }: ConnectionsListProps = $props();

  // Filter connections based on search query
  let filteredConnections = $derived(
    connections.filter((connection) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return connection.searchableText.includes(searchLower);
    }),
  );
</script>

{#if loading}
  <div class="flex items-center justify-center py-8">
    <LoadingSpinner />
  </div>
{:else if filteredConnections.length === 0}
  <div class="py-8 text-center">
    {#if searchQuery}
      <!-- No search results -->
      <div class="text-center">
        <Search class="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <h4 class="mb-2 font-medium text-gray-900">No matches found</h4>
        <p class="text-sm text-gray-500">Try adjusting your search terms.</p>
      </div>
    {:else if connections.length === 0}
      <!-- No connections at all -->
      <div>
        <User class="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h4 class="mb-2 text-lg font-semibold text-gray-900">
          No Connections Yet
        </h4>
        <p class="mb-6 text-gray-600">
          Apply to events and get approved to start building your network!
        </p>
        <button
          onclick={onDiscoverClick}
          class="rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
        >
          Discover Events
        </button>
      </div>
    {/if}
  </div>
{:else}
  <!-- Connections list -->
  <div class="space-y-3">
    {#each filteredConnections as connection (connection._id)}
      <ConnectionItem {connection} {onEdit} {onMessage} />
    {/each}
  </div>
{/if}
