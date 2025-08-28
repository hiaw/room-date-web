<script lang="ts">
  import type { Id } from "../../../convex/_generated/dataModel";
  import { MessageCircle, Calendar } from "lucide-svelte";
  import { formatDistanceToNow } from "date-fns";

  interface Conversation {
    connectionId: Id<"connections">;
    otherUser?: {
      profile?: {
        displayName?: string;
      } | null;
    };
    lastMessage?: {
      _id: Id<"messages">;
      _creationTime: number;
      content?: string;
    } | null;
    unreadCount?: number;
  }

  interface Props {
    conversations: Conversation[];
    searchQuery: string;
    onConversationClick: (connectionId: string) => void;
    onDiscoverClick: () => void;
  }

  let {
    conversations,
    searchQuery,
    onConversationClick,
    onDiscoverClick,
  }: Props = $props();

  function getUserInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
</script>

{#if conversations.length === 0}
  <div class="py-16 text-center">
    <div
      class="mx-auto max-w-md rounded-3xl border border-white/50 bg-white/70 p-12 backdrop-blur-sm"
    >
      <MessageCircle class="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <h3 class="mb-2 text-xl font-semibold text-gray-900">No Messages Yet</h3>
      <p class="mb-8 text-gray-600">
        {searchQuery
          ? "No conversations match your search."
          : "Start conversations with people you connect with at events."}
      </p>
      {#if !searchQuery}
        <button
          onclick={onDiscoverClick}
          class="rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
        >
          Discover Events
        </button>
      {/if}
    </div>
  </div>
{:else}
  <div class="space-y-2">
    {#each conversations as conversation (conversation.connectionId)}
      <div
        class="cursor-pointer rounded-2xl border border-white/50 bg-white/90 p-4 backdrop-blur-sm transition-all hover:shadow-md"
        onclick={() => onConversationClick(conversation.connectionId)}
        onkeydown={(e) =>
          e.key === "Enter" && onConversationClick(conversation.connectionId)}
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
                {conversation.otherUser?.profile?.displayName || "Unknown User"}
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
              {conversation.lastMessage?.content || "No messages yet"}
            </p>

            <div class="flex items-center text-xs text-gray-500">
              <Calendar size={12} class="mr-1" />
              <span>Connected at an event</span>
            </div>
          </div>

          <!-- Unread Indicator -->
          {#if conversation.unreadCount && conversation.unreadCount > 0}
            <div class="h-3 w-3 flex-shrink-0 rounded-full bg-purple-500"></div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}
