<script lang="ts">
  import { ChevronRight } from "lucide-svelte";

  interface Props {
    onPasswordReset: () => void;
    onSignOut: () => void;
  }

  let { onPasswordReset, onSignOut }: Props = $props();
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold text-gray-900">Account</h2>

  <div
    class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
  >
    <div class="space-y-1">
      <button
        onclick={onPasswordReset}
        class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50"
      >
        <div class="font-medium text-gray-700">Reset Password</div>
        <ChevronRight size={16} class="text-gray-400" />
      </button>

      <button
        onclick={onSignOut}
        class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-red-50"
      >
        <div class="font-medium text-red-600">Sign Out</div>
        <ChevronRight size={16} class="text-red-400" />
      </button>
    </div>
  </div>
</div>
