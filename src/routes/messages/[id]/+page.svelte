<script lang="ts">
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { isAuthenticated, currentUser } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import type { Id } from "../../../convex/_generated/dataModel";

  // Get connection ID from URL
  const connectionId = $derived($page.params.id as Id<"connections">);

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // State
  let messageText = $state("");
  let messagesContainer: HTMLDivElement;
  let isSubmitting = $state(false);

  // Queries
  const messagesQuery = useQuery(api.connections.getMessages, () => ({
    connectionId,
  }));
  const connectionQuery = useQuery(api.connections.getConnection, () => ({
    connectionId,
  }));

  // Convex client for mutations
  const convex = useConvexClient();

  // Derived state
  const messages = $derived(messagesQuery.data?.messages ?? []);
  const connection = $derived(connectionQuery.data);
  const loading = $derived(
    messagesQuery.isLoading || connectionQuery.isLoading,
  );
  const otherUser = $derived(connection?.otherUser);
  const currentUserId = $derived($currentUser?._id);

  // Scroll to bottom when messages change
  $effect(() => {
    if (messages && messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50);
    }
  });

  // Mark messages as read when component mounts or messages change
  onMount(() => {
    if (connectionId) {
      convex.mutation(api.connections.markMessagesAsRead, { connectionId });
    }
  });

  $effect(() => {
    if (messages.length > 0) {
      convex.mutation(api.connections.markMessagesAsRead, { connectionId });
    }
  });

  // Event handlers
  async function handleSendMessage() {
    if (!messageText.trim()) return;

    isSubmitting = true;
    try {
      await convex.mutation(api.connections.sendMessage, {
        connectionId,
        content: messageText.trim(),
        messageType: "text",
      });
      messageText = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function formatTime(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );

    if (messageDate.getTime() === today.getTime()) {
      // Today - just show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (messageDate.getTime() === today.getTime() - 86400000) {
      // Yesterday
      return (
        "Yesterday " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      // Older
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  }
</script>

<svelte:head>
  <title>
    {otherUser?.profile?.displayName
      ? `Chat with ${otherUser.profile.displayName}`
      : "Messages"} - Room Dates
  </title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <!-- Header -->
  <div
    class="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3"
  >
    <div class="flex items-center space-x-3">
      <Button
        variant="secondary"
        size="sm"
        onclick={() => goto("/connections")}
        class="p-2"
      >
        {#snippet children()}
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        {/snippet}
      </Button>

      {#if loading}
        <div class="flex items-center space-x-2">
          <div class="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
          <div class="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      {:else if otherUser}
        <div class="flex items-center space-x-3">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-medium text-white"
          >
            {otherUser.profile?.profileImageUrl
              ? ""
              : (otherUser.profile?.displayName?.charAt(0)?.toUpperCase() ??
                "U")}
            {#if otherUser.profile?.profileImageUrl}
              <img
                src={otherUser.profile.profileImageUrl}
                alt={otherUser.profile?.displayName ?? "User"}
                class="h-8 w-8 rounded-full object-cover"
              />
            {/if}
          </div>
          <div>
            <h1 class="font-semibold text-gray-900">
              {otherUser.profile?.displayName ?? "Unknown User"}
            </h1>
          </div>
        </div>
      {/if}
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else if !connection}
    <div class="flex flex-col items-center justify-center px-4 py-16">
      <div class="text-center text-gray-400">
        <h2 class="mb-2 text-lg font-medium text-gray-900">
          Connection not found
        </h2>
        <p class="mb-4 text-gray-600">
          This conversation doesn't exist or you don't have access to it.
        </p>
        <Button onclick={() => goto("/connections")}>
          {#snippet children()}
            Back to Connections
          {/snippet}
        </Button>
      </div>
    </div>
  {:else}
    <!-- Messages Container -->
    <div
      bind:this={messagesContainer}
      class="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      style="height: calc(100vh - 140px);"
    >
      {#if messages.length === 0}
        <div
          class="flex flex-col items-center justify-center py-16 text-gray-400"
        >
          <div
            class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100"
          >
            <svg
              class="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p class="text-center">
            Start a conversation with {otherUser?.profile?.displayName}
          </p>
        </div>
      {:else}
        {#each messages as message (message._id)}
          {@const isCurrentUser = message.senderId === currentUserId}
          <div class="flex {isCurrentUser ? 'justify-end' : 'justify-start'}">
            <div class="flex max-w-xs items-end space-x-2 lg:max-w-md">
              {#if !isCurrentUser}
                <div
                  class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-medium text-white"
                >
                  {message.senderProfileImageUrl
                    ? ""
                    : (message.senderDisplayName?.charAt(0)?.toUpperCase() ??
                      "U")}
                  {#if message.senderProfileImageUrl}
                    <img
                      src={message.senderProfileImageUrl}
                      alt={message.senderDisplayName ?? "User"}
                      class="h-6 w-6 rounded-full object-cover"
                    />
                  {/if}
                </div>
              {/if}

              <div
                class="flex flex-col {isCurrentUser
                  ? 'items-end'
                  : 'items-start'}"
              >
                <div
                  class="max-w-full rounded-2xl px-3 py-2 break-words {isCurrentUser
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-900'}"
                >
                  {#if message.messageType === "image" && message.imageUrl}
                    <img
                      src={message.imageUrl}
                      alt="Shared image"
                      class="h-auto max-w-full rounded-lg"
                    />
                    {#if message.content}
                      <p class="mt-2">{message.content}</p>
                    {/if}
                  {:else}
                    <p>{message.content}</p>
                  {/if}
                </div>
                <span class="mt-1 px-1 text-xs text-gray-400">
                  {formatTime(message._creationTime)}
                </span>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <!-- Message Input -->
    <div class="border-t border-gray-200 bg-white px-4 py-3">
      <div class="flex items-end space-x-3">
        <div class="flex-1">
          <textarea
            bind:value={messageText}
            onkeydown={handleKeyDown}
            placeholder="Type a message..."
            class="max-h-32 w-full resize-none rounded-2xl border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
            rows="1"
            style="min-height: 40px;"
          ></textarea>
        </div>
        <Button
          onclick={handleSendMessage}
          disabled={!messageText.trim() || isSubmitting}
          class="flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-2 text-white hover:from-purple-600 hover:to-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {#snippet children()}
            {#if isSubmitting}
              <LoadingSpinner size="sm" />
            {:else}
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            {/if}
          {/snippet}
        </Button>
      </div>
    </div>
  {/if}
</div>
