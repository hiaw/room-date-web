<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import ConnectionsHeader from "$lib/components/connections/ConnectionsHeader.svelte";
  import ConversationsList from "$lib/components/connections/ConversationsList.svelte";
  import ConnectionsList from "$lib/components/connections/ConnectionsList.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // State
  let searchQuery = $state("");
  let activeTab = $state<"messages" | "connections">("messages");

  // Reactive queries
  let connectionsQueryResult = useQuery(api.connections.getUserConnections, {});
  let conversationsQueryResult = useQuery(
    api.connections.getUserConversations,
    {},
  );

  let connections = $derived(connectionsQueryResult?.data ?? []);
  let conversations = $derived(conversationsQueryResult?.data ?? []);
  let loading = $derived(
    (connectionsQueryResult?.isLoading ?? true) ||
      (conversationsQueryResult?.isLoading ?? true),
  );

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

  let filteredConnections = $derived(
    connections.filter((connection) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return connection.otherUser?.profile?.displayName
        ?.toLowerCase()
        .includes(searchLower);
    }),
  );

  // Event handlers
  function handleSearchChange(query: string) {
    searchQuery = query;
  }

  function handleTabChange(tab: "messages" | "connections") {
    activeTab = tab;
  }

  function openConversation(connectionId: string) {
    goto(`/messages/${connectionId}`);
  }

  function viewConnection(connectionId: string) {
    goto(`/connections/${connectionId}`);
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
  <ConnectionsHeader
    {searchQuery}
    {activeTab}
    onSearchChange={handleSearchChange}
    onTabChange={handleTabChange}
  />

  <!-- Content -->
  <div class="px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else if activeTab === "messages"}
      <ConversationsList
        conversations={filteredConversations}
        {searchQuery}
        onConversationClick={openConversation}
        onDiscoverClick={handleDiscoverClick}
      />
    {:else}
      <ConnectionsList
        connections={filteredConnections}
        {searchQuery}
        onConnectionClick={viewConnection}
        onMessageClick={openConversation}
        onDiscoverClick={handleDiscoverClick}
      />
    {/if}
  </div>
</div>
