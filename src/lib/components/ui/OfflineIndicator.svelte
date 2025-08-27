<script lang="ts">
  import { networkStore } from "../../stores/network.js";

  let { isOnline, wasOffline } = $state($networkStore);
</script>

{#if !isOnline}
  <div
    class="fixed top-0 right-0 left-0 z-50 border-b border-orange-200 bg-orange-50 px-4 py-3"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <svg
          class="mr-2 h-4 w-4 text-orange-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-sm font-medium text-orange-700">You're offline</span>
      </div>
      <span class="text-xs text-orange-600">Some features may not work</span>
    </div>
  </div>
{:else if wasOffline}
  <div
    class="animate-in slide-in-from-top-2 fixed top-0 right-0 left-0 z-50 border-b border-green-200 bg-green-50 px-4 py-3 duration-300"
  >
    <div class="flex items-center">
      <svg
        class="mr-2 h-4 w-4 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span class="text-sm font-medium text-green-700">Back online!</span>
    </div>
  </div>
{/if}
