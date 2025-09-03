<script lang="ts">
  import { Lock, LogOut } from "lucide-svelte";
  import { goto } from "$app/navigation";

  interface Props {
    onPasswordReset: () => void;
    onSignOut: () => void;
  }

  let { onPasswordReset, onSignOut }: Props = $props();
</script>

<div
  class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
>
  <h3 class="mb-4 text-lg font-semibold text-gray-900">Settings</h3>

  <div class="space-y-2">
    <!-- Account Settings -->
    <div class="space-y-2">
      <button
        onclick={onPasswordReset}
        class="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Lock size={18} />
        <span>Reset Password</span>
      </button>

      <button
        onclick={() => goto("/profile/privacy")}
        class="w-full rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
      >
        Privacy Settings
      </button>

      <button
        onclick={() => goto("/profile/notifications")}
        class="w-full rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
      >
        Notification Preferences
      </button>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-100 pt-3">
      <!-- App Info -->
      <button
        onclick={() => goto("/about")}
        class="w-full rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
      >
        About Room Dates
      </button>

      <button
        onclick={() => goto("/help")}
        class="w-full rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
      >
        Help & Support
      </button>

      <button
        onclick={() => goto("/privacy")}
        class="w-full rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
      >
        Privacy Policy
      </button>

      <button
        onclick={() => goto("/terms")}
        class="w-full rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
      >
        Terms of Service
      </button>
    </div>

    <!-- Sign Out -->
    <div class="border-t border-gray-100 pt-3">
      <button
        onclick={onSignOut}
        class="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
      >
        <LogOut size={18} />
        <span>Sign Out</span>
      </button>
    </div>
  </div>
</div>
