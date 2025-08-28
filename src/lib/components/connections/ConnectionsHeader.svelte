<script lang="ts">
  interface Props {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    activeTab: "messages" | "connections";
    onTabChange: (tab: "messages" | "connections") => void;
  }

  let { searchQuery, onSearchChange, activeTab, onTabChange }: Props = $props();

  import { Search } from "lucide-svelte";
</script>

<div
  class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
>
  <div class="px-4 py-4">
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-gray-900">Messages</h1>
      <p class="text-sm text-gray-600">Connect with people you've met</p>
    </div>

    <!-- Search Bar -->
    <div class="relative mb-4">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
      />
      <input
        type="text"
        placeholder="Search conversations or connections..."
        class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
        value={searchQuery}
        oninput={(e) => onSearchChange(e.currentTarget.value)}
      />
    </div>

    <!-- Tabs -->
    <div class="flex rounded-xl bg-gray-100 p-1">
      <button
        onclick={() => onTabChange("messages")}
        class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all {activeTab ===
        'messages'
          ? 'bg-white text-purple-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'}"
      >
        Messages
      </button>
      <button
        onclick={() => onTabChange("connections")}
        class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all {activeTab ===
        'connections'
          ? 'bg-white text-purple-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'}"
      >
        All Connections
      </button>
    </div>
  </div>
</div>
