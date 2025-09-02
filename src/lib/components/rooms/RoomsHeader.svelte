<script lang="ts">
  import { Plus } from "lucide-svelte";

  interface Props {
    onCreateRoom: () => void;
  }

  let { onCreateRoom }: Props = $props();
</script>

<div
  class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
>
  <div class="px-4 py-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Rooms</h1>
        <p class="text-sm text-gray-600">Manage your spaces and events</p>
      </div>
      <button
        onclick={onCreateRoom}
        class="inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
      >
        <Plus size={18} />
        <span class="hidden sm:inline">New Room</span>
      </button>
    </div>
  </div>
</div>
