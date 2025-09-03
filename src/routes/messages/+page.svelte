<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import ConversationsList from "$lib/components/connections/ConversationsList.svelte";
  import { Search } from "lucide-svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // State
  let searchQuery = $state("");

  // Reactive queries
  let conversationsQueryResult = useQuery(
    api.connections.getUserConversations,
    {},
  );

  let conversations = $derived(conversationsQueryResult?.data ?? []);
  let loading = $derived(conversationsQueryResult?.isLoading ?? true);

  let filteredConversations = $derived(
    conversations.filter((conversation) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        conversation.otherUser?.profile?.displayName
          ?.toLowerCase()
          .includes(searchLower) ||
        conversation.lastMessage?.content?.toLowerCase().includes(searchLower)
      );
    }),
  );

  // Event handlers
  function handleSearchChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    searchQuery = target.value;
  }

  function openConversation(connectionId: string) {
    goto(`/messages/${connectionId}`);
  }

  function handleDiscoverClick() {
    goto("/discover");
  }
</script>

<svelte:head>
  <title>Messages - Room Dates</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
>
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="mb-4">
        <h1 class="text-2xl font-bold text-gray-900">Messages</h1>
        <p class="text-sm text-gray-600">Your conversations and event chats</p>
      </div>

      <!-- Search Bar -->
      <div class="relative">
        <Search
          class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
        />
        <input
          type="text"
          placeholder="Search conversations..."
          class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
          value={searchQuery}
          oninput={handleSearchChange}
        />
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else}
      <ConversationsList
        conversations={filteredConversations}
        {searchQuery}
        onConversationClick={openConversation}
        onDiscoverClick={handleDiscoverClick}
      />
    {/if}
  </div>
</div>
