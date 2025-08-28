<script lang="ts">
  import type { Doc } from "../../../convex/_generated/dataModel.js";

  interface Props {
    room: Doc<"rooms">;
  }

  let { room }: Props = $props();
</script>

<div class="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
  <div class="flex items-center space-x-3">
    {#if room.primaryImageUrl}
      <img
        src={room.primaryImageUrl}
        alt={room.title}
        class="h-12 w-12 rounded-lg object-cover"
      />
    {:else}
      <div
        class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100"
      >
        <span class="font-medium text-purple-600">{room.title.charAt(0)}</span>
      </div>
    {/if}
    <div>
      <h3 class="font-medium text-gray-900">{room.title}</h3>
      <p class="text-sm text-gray-600">{room.city}, {room.state}</p>
    </div>
  </div>
</div>
