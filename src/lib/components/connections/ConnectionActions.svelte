<script lang="ts">
  import { Edit3, MessageCircle } from "lucide-svelte";
  import type { ConnectionActionsProps } from "$lib/types/domains/connections.js";

  let {
    connectionId,
    onEdit,
    onMessage,
    showEditButton = true,
  }: ConnectionActionsProps = $props();
</script>

<div class="flex items-center space-x-2">
  {#if showEditButton}
    <button
      onclick={() => onEdit(connectionId)}
      class="rounded-lg p-2 text-gray-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-50"
      title="Edit note"
    >
      <Edit3 size={16} />
    </button>
  {/if}
  <button
    onclick={() => onMessage(connectionId)}
    class="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"
    title="Send message"
  >
    <MessageCircle size={18} />
  </button>
</div>
