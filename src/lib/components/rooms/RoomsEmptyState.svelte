<script lang="ts">
  import { Plus, Home } from "lucide-svelte";

  interface Props {
    onCreateRoom: () => void;
  }

  let { onCreateRoom }: Props = $props();
</script>

<div class="py-16 text-center">
  <div
    class="mx-auto max-w-md rounded-3xl border border-white/50 bg-white/70 p-12 backdrop-blur-sm"
  >
    <Home class="mx-auto mb-4 h-16 w-16 text-gray-400" />
    <h3 class="mb-2 text-xl font-semibold text-gray-900">
      Create Your First Room
    </h3>
    <p class="mb-8 text-gray-600">
      Rooms are your personal spaces where you can host events and connect with
      people who share your interests.
    </p>
    <button
      onclick={onCreateRoom}
      class="inline-flex items-center space-x-2 rounded-xl bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
    >
      <Plus size={20} />
      <span>Create Room</span>
    </button>
  </div>
</div>
