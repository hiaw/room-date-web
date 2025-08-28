<script lang="ts">
  import type { Id } from "../../../convex/_generated/dataModel";
  import { User, Calendar, MessageCircle } from "lucide-svelte";
  import { formatDistanceToNow } from "date-fns";

  interface Connection {
    _id: Id<"connections">;
    _creationTime: number;
    otherUser?: {
      profile?: {
        displayName?: string;
      } | null;
    };
  }

  interface Props {
    connections: Connection[];
    searchQuery: string;
    onConnectionClick: (connectionId: string) => void;
    onMessageClick: (connectionId: string) => void;
    onDiscoverClick: () => void;
  }

  let {
    connections,
    searchQuery,
    onConnectionClick,
    onMessageClick,
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

{#if connections.length === 0}
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
    {#each connections as connection (connection._id)}
      <div
        class="cursor-pointer rounded-2xl border border-white/50 bg-white/90 p-4 backdrop-blur-sm transition-all hover:shadow-md"
        onclick={() => onConnectionClick(connection._id)}
        onkeydown={(e) =>
          e.key === "Enter" && onConnectionClick(connection._id)}
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
                {connection.otherUser?.profile?.displayName || "Unknown User"}
              </h3>
              <span class="text-xs text-gray-500">
                {formatDistanceToNow(new Date(connection._creationTime), {
                  addSuffix: true,
                })}
              </span>
            </div>

            <div class="mb-2 flex items-center space-x-2 text-sm text-gray-600">
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
                onMessageClick(connection._id);
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
