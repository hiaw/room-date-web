<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";

  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { MessageCircle, User, Calendar, Search } from "lucide-svelte";
  import { formatDistanceToNow } from "date-fns";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // State
  let searchQuery = $state("");
  let activeTab = $state("messages"); // "messages" or "connections"

  // Reactive queries
  let connectionsQueryResult = useQuery(api.connections.getUserConnections, {});
  let conversationsQueryResult = useQuery(
    api.connections.getUserConversations,
    {},
  );

  let connections = $derived(connectionsQueryResult.data ?? []);
  let conversations = $derived(conversationsQueryResult.data ?? []);
  let loading = $derived(
    connectionsQueryResult.isLoading || conversationsQueryResult.isLoading,
  );

  // Filter connections/conversations based on search
  let filteredConnections = $derived(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connections.filter((connection: any) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        connection.otherUserName?.toLowerCase().includes(searchLower) ||
        connection.eventTitle?.toLowerCase().includes(searchLower) ||
        connection.roomTitle?.toLowerCase().includes(searchLower)
      );
    }),
  );

  let filteredConversations = $derived(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    conversations.filter((conversation: any) => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        conversation.otherUserName?.toLowerCase().includes(searchLower) ||
        conversation.lastMessage?.toLowerCase().includes(searchLower)
      );
    }),
  );

  function openConversation(connectionId: string) {
    goto(`/messages/${connectionId}`);
  }

  function viewConnection(connectionId: string) {
    goto(`/connections/${connectionId}`);
  }

  function getUserInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
        <p class="text-sm text-gray-600">Connect with people you've met</p>
      </div>

      <!-- Search Bar -->
      <div class="relative mb-4">
        <Search
          class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
        />
        <input
          type="text"
          placeholder="Search conversations or connections..."
          class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
          bind:value={searchQuery}
        />
      </div>

      <!-- Tabs -->
      <div class="flex rounded-xl bg-gray-100 p-1">
        <button
          onclick={() => (activeTab = "messages")}
          class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all {activeTab ===
          'messages'
            ? 'bg-white text-purple-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'}"
        >
          Messages
        </button>
        <button
          onclick={() => (activeTab = "connections")}
          class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all {activeTab ===
          'connections'
            ? 'bg-white text-purple-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'}"
        >
          All Connections
        </button>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else if activeTab === "messages"}
      <!-- Messages Tab -->
      {#if filteredConversations.length === 0}
        <div class="py-16 text-center">
          <div
            class="mx-auto max-w-md rounded-3xl border border-white/50 bg-white/70 p-12 backdrop-blur-sm"
          >
            <MessageCircle class="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              No Messages Yet
            </h3>
            <p class="mb-8 text-gray-600">
              {searchQuery
                ? "No conversations match your search."
                : "Start conversations with people you connect with at events."}
            </p>
            {#if !searchQuery}
              <button
                onclick={() => goto("/discover")}
                class="rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
              >
                Discover Events
              </button>
            {/if}
          </div>
        </div>
      {:else}
        <div class="space-y-2">
          {#each filteredConversations as conversation (conversation.connectionId)}
            <div
              class="cursor-pointer rounded-2xl border border-white/50 bg-white/90 p-4 backdrop-blur-sm transition-all hover:shadow-md"
              onclick={() => openConversation(conversation.connectionId)}
              onkeydown={(e) =>
                e.key === "Enter" &&
                openConversation(conversation.connectionId)}
              role="button"
              tabindex="0"
            >
              <div class="flex items-center space-x-4">
                <!-- Avatar -->
                <div
                  class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                >
                  <span class="text-sm font-medium text-white">
                    {getUserInitials(
                      conversation.otherUser?.profile?.displayName || "?",
                    )}
                  </span>
                </div>

                <!-- Content -->
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-center justify-between">
                    <h3 class="truncate font-semibold text-gray-900">
                      {conversation.otherUser?.profile?.displayName ||
                        "Unknown User"}
                    </h3>
                    <span class="flex-shrink-0 text-xs text-gray-500">
                      {#if conversation.lastMessage?._creationTime}
                        {formatDistanceToNow(
                          new Date(conversation.lastMessage._creationTime),
                          { addSuffix: true },
                        )}
                      {:else}
                        Recently
                      {/if}
                    </span>
                  </div>

                  <p class="mb-2 truncate text-sm text-gray-600">
                    {conversation.lastMessage || "No messages yet"}
                  </p>

                  <div class="flex items-center text-xs text-gray-500">
                    <Calendar size={12} class="mr-1" />
                    <span>Connected at an event</span>
                  </div>
                </div>

                <!-- Unread Indicator -->
                {#if conversation.unreadCount && conversation.unreadCount > 0}
                  <div
                    class="h-3 w-3 flex-shrink-0 rounded-full bg-purple-500"
                  ></div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- Connections Tab -->
      {#if filteredConnections.length === 0}
        <div class="py-16 text-center">
          <div
            class="mx-auto max-w-md rounded-3xl border border-white/50 bg-white/70 p-12 backdrop-blur-sm"
          >
            <User class="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              No Connections Yet
            </h3>
            <p class="mb-8 text-gray-600">
              {searchQuery
                ? "No connections match your search."
                : "Apply to events and get approved to start making connections!"}
            </p>
            {#if !searchQuery}
              <button
                onclick={() => goto("/discover")}
                class="rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
              >
                Discover Events
              </button>
            {/if}
          </div>
        </div>
      {:else}
        <div class="space-y-2">
          {#each filteredConnections as connection (connection._id)}
            <div
              class="cursor-pointer rounded-2xl border border-white/50 bg-white/90 p-4 backdrop-blur-sm transition-all hover:shadow-md"
              onclick={() => viewConnection(connection._id)}
              onkeydown={(e) =>
                e.key === "Enter" && viewConnection(connection._id)}
              role="button"
              tabindex="0"
            >
              <div class="flex items-center space-x-4">
                <!-- Avatar -->
                <div
                  class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                >
                  <span class="text-sm font-medium text-white">
                    {getUserInitials(
                      connection.otherUser?.profile?.displayName || "?",
                    )}
                  </span>
                </div>

                <!-- Content -->
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-center justify-between">
                    <h3 class="truncate font-semibold text-gray-900">
                      {connection.otherUser?.profile?.displayName ||
                        "Unknown User"}
                    </h3>
                    <span class="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(connection._creationTime), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div
                    class="mb-2 flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <Calendar size={14} />
                    <span class="truncate">Met at: an event</span>
                  </div>

                  <div class="flex items-center text-xs text-gray-500">
                    <span class="truncate">in a room</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center space-x-2">
                  <button
                    onclick={(e) => {
                      e.stopPropagation();
                      openConversation(connection._id);
                    }}
                    class="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"
                    title="Send message"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>
