<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { ArrowLeft, Send, Users, Loader2 } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import MessageBubble from "$lib/components/events/MessageBubble.svelte";
  import ParticipantsList from "$lib/components/events/ParticipantsList.svelte";
  import type { Id } from "../../../../convex/_generated/dataModel";

  const eventId = $page.params.eventId as Id<"events">;

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Create convex client for mutations
  let convex = useConvexClient();

  // Check if user can access this chat
  let accessQuery = useQuery(api.eventChat.canAccessEventChat, { eventId });
  let canAccess = $derived(accessQuery?.data);
  let accessLoading = $derived(accessQuery?.isLoading ?? true);

  // Get event chat info
  let chatInfoQuery = useQuery(api.eventChat.getEventChatInfo, { eventId });
  let chatInfo = $derived(
    canAccess?.canAccess ? chatInfoQuery?.data : undefined,
  );

  // Get messages
  let messagesQuery = useQuery(api.eventChat.getEventMessages, { eventId });
  let messages = $derived(
    canAccess?.canAccess ? messagesQuery?.data?.page || [] : [],
  );
  let messagesLoading = $derived(messagesQuery?.isLoading ?? true);

  // Get participants
  let participantsQuery = useQuery(api.eventChat.getEventChatParticipants, {
    eventId,
  });
  let participants = $derived(
    canAccess?.canAccess ? participantsQuery?.data || [] : [],
  );

  // Get current user profile data (move from MessageBubble)
  let userProfileQuery = useQuery(api.userProfiles.getUserProfile, {});
  let currentUserData = $derived(userProfileQuery?.data);
  let currentUser = $derived(currentUserData?.user);
  let currentUserProfile = $derived(currentUserData?.profile);

  // UI state
  let messageInput = $state("");
  let sending = $state(false);
  let showParticipants = $state(false);
  let messagesContainer = $state<HTMLDivElement>();

  // Auto-scroll to bottom
  $effect(() => {
    if (messagesContainer && messages.length > 0) {
      setTimeout(() => {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }
  });

  // Mark messages as seen when page loads
  onMount(async () => {
    if (canAccess?.canAccess) {
      try {
        await convex.mutation(api.eventChat.markEventMessagesSeen, { eventId });
      } catch (error) {
        console.error("Failed to mark messages as seen:", error);
      }
    }
  });

  async function handleSendMessage() {
    const content = messageInput.trim();
    if (!content || sending) return;

    const tempMessage = content;
    messageInput = "";
    sending = true;

    try {
      await convex.mutation(api.eventChat.sendEventMessage, {
        eventId,
        content: tempMessage,
        messageType: "text",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      messageInput = tempMessage; // Restore message on error
      alert("Failed to send message. Please try again.");
    } finally {
      sending = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  function handleBack() {
    goto(`/events/${eventId}`);
  }

  function handleShowParticipants() {
    showParticipants = true;
  }

  // Cleanup
  onDestroy(() => {
    // Mark messages as seen when leaving
    if (canAccess?.canAccess) {
      convex
        .mutation(api.eventChat.markEventMessagesSeen, { eventId })
        .catch(console.error);
    }
  });
</script>

<svelte:head>
  <title
    >{chatInfo?.event.title ? `${chatInfo.event.title} Chat` : "Event Chat"} - Room
    Dates</title
  >
</svelte:head>

<div
  class="flex h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50"
>
  {#if accessLoading}
    <div class="flex flex-1 items-center justify-center">
      <LoadingSpinner />
    </div>
  {:else if !canAccess?.canAccess}
    <div class="flex flex-1 flex-col items-center justify-center p-6">
      <h2 class="mb-2 text-2xl font-bold text-gray-900">Access Denied</h2>
      <p class="mb-4 text-center text-gray-600">
        {canAccess?.reason === "Not authenticated"
          ? "Please sign in to access this chat."
          : "You must be an approved participant to access this event chat."}
      </p>
      <Button onclick={handleBack}>Go Back</Button>
    </div>
  {:else}
    <!-- Header -->
    <div class="border-b border-gray-100 bg-white/90 backdrop-blur-md">
      <div class="flex items-center justify-between px-4 py-4">
        <div class="flex items-center space-x-3">
          <button
            onclick={handleBack}
            class="rounded-xl bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">
              {chatInfo?.event.title || "Event Chat"}
            </h1>
            <p class="text-sm text-gray-600">
              {chatInfo?.event.roomTitle} • {chatInfo?.participantCount || 0} participants
            </p>
          </div>
        </div>
        <button
          onclick={handleShowParticipants}
          class="rounded-xl bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <Users size={20} />
        </button>
      </div>
    </div>

    <!-- Messages Area -->
    <div
      bind:this={messagesContainer}
      class="flex-1 space-y-3 overflow-y-auto px-4 py-4"
    >
      {#if messagesLoading}
        <div class="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      {:else if messages.length === 0}
        <div
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <div class="mb-4 text-6xl">👋</div>
          <h3 class="mb-2 text-xl font-semibold text-gray-900">
            Start the conversation
          </h3>
          <p class="text-gray-600">
            Be the first to send a message to the group!
          </p>
        </div>
      {:else}
        {#each messages as message (message._id)}
          <MessageBubble
            {message}
            currentUserId={currentUser?._id}
            {currentUserProfile}
          />
        {/each}
      {/if}
    </div>

    <!-- Message Input -->
    <div class="border-t border-gray-100 bg-white/90 p-4 backdrop-blur-md">
      <div class="flex items-end space-x-3">
        <div class="flex-1">
          <textarea
            bind:value={messageInput}
            onkeydown={handleKeyDown}
            placeholder="Type a message..."
            rows="1"
            disabled={sending}
            class="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
            style="min-height: 44px; max-height: 120px;"
          ></textarea>
        </div>
        <button
          onclick={handleSendMessage}
          disabled={!messageInput.trim() || sending}
          class="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {#if sending}
            <Loader2 size={18} class="animate-spin" />
          {:else}
            <Send size={18} />
          {/if}
        </button>
      </div>
    </div>

    <!-- Participants Modal -->
    {#if showParticipants}
      <ParticipantsList
        {participants}
        eventTitle={chatInfo?.event.title}
        onClose={() => (showParticipants = false)}
      />
    {/if}
  {/if}
</div>
