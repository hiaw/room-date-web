<script lang="ts">
  import { Users, ChevronRight } from "lucide-svelte";
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold text-gray-900">Social</h2>

  <!-- My Connections -->
  <div
    class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
  >
    <a
      href="/connections"
      class="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition-colors hover:bg-gray-50"
    >
      <div class="flex items-center space-x-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100"
        >
          <Users size={20} class="text-purple-600" />
        </div>
        <div>
          <div class="font-medium text-gray-900">My Connections</div>
          <div class="text-sm text-gray-600">
            Manage connections with personal notes and tags
          </div>
        </div>
      </div>
      <ChevronRight size={20} class="text-gray-400" />
    </a>
  </div>
</div>
