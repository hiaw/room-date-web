<script lang="ts">
  import { Calendar } from "lucide-svelte";
  import { formatDistanceToNow } from "date-fns";
  import {
    getUserInitials,
    hasCustomNickname,
  } from "$lib/utils/userDisplay.js";
  import ConnectionActions from "./ConnectionActions.svelte";
  import type { ConnectionItemProps } from "$lib/types/domains/connections.js";

  let { connection, onEdit, onMessage }: ConnectionItemProps = $props();
</script>

<div
  class="group rounded-xl border border-gray-100 bg-white p-4 transition-all hover:shadow-md"
>
  <div class="flex items-center space-x-4">
    <!-- Avatar -->
    <div
      class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
    >
      <span class="text-sm font-medium text-white">
        {getUserInitials(connection.displayName)}
      </span>
    </div>

    <!-- Content -->
    <div class="min-w-0 flex-1">
      <div class="mb-1 flex items-start justify-between">
        <div class="min-w-0">
          <h4 class="truncate font-semibold text-gray-900">
            {connection.displayName}
          </h4>
          {#if hasCustomNickname(connection.note?.nickname, connection.otherUser?.profile?.displayName)}
            <p class="text-xs text-gray-500">
              aka {connection.otherUser?.profile?.displayName || "Unknown"}
            </p>
          {/if}
        </div>
        <span class="text-xs text-gray-500">
          {formatDistanceToNow(new Date(connection._creationTime), {
            addSuffix: true,
          })}
        </span>
      </div>

      <!-- Connection details -->
      <div class="mb-2 flex items-center space-x-2 text-sm text-gray-600">
        <Calendar size={14} />
        <span class="truncate">Connected at an event</span>
      </div>

      <!-- Notes preview -->
      {#if connection.note?.notes}
        <p class="mb-2 line-clamp-2 text-sm text-gray-600">
          {connection.note.notes}
        </p>
      {/if}

      <!-- Tags -->
      {#if connection.note?.tags && connection.note.tags.length > 0}
        <div class="mb-2 flex flex-wrap gap-1">
          {#each connection.note.tags.slice(0, 3) as tag, i (tag + i)}
            <span
              class="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700"
            >
              {tag}
            </span>
          {/each}
          {#if connection.note.tags.length > 3}
            <span class="text-xs text-gray-500">
              +{connection.note.tags.length - 3} more
            </span>
          {/if}
        </div>
      {/if}

      <!-- Last message -->
      {#if connection.lastMessage}
        <div class="text-xs text-gray-500">
          Last message: {formatDistanceToNow(
            new Date(connection.lastMessage._creationTime),
            { addSuffix: true },
          )}
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <ConnectionActions connectionId={connection._id} {onEdit} {onMessage} />
  </div>
</div>
