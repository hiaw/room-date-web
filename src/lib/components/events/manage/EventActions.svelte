<script lang="ts">
  import { Eye, Edit3, Trash2 } from "lucide-svelte";
  import Button from "../../ui/Button.svelte";
  import type { EventManagementActions } from "../../../types/events.js";

  interface Props {
    actions: EventManagementActions;
    isDeleting?: boolean;
  }

  let { actions, isDeleting = false }: Props = $props();
</script>

<div
  class="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
>
  <h3 class="mb-4 text-lg font-semibold text-gray-900">Event Actions</h3>

  <div class="space-y-3">
    <Button
      onclick={actions.onViewEvent}
      class="w-full justify-start bg-blue-600 hover:bg-blue-700"
    >
      <Eye size={18} class="mr-2" />
      View Event Page
    </Button>

    <Button
      onclick={actions.onEditEvent}
      class="w-full justify-start bg-purple-600 hover:bg-purple-700"
    >
      <Edit3 size={18} class="mr-2" />
      Edit Event Details
    </Button>

    <Button
      onclick={actions.onDeleteEvent}
      disabled={isDeleting}
      class="w-full justify-start bg-red-600 hover:bg-red-700"
    >
      {#if isDeleting}
        <div
          class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        ></div>
      {:else}
        <Trash2 size={18} class="mr-2" />
      {/if}
      Delete Event
    </Button>
  </div>
</div>
