<script lang="ts">
  import { Users, ChevronRight } from "lucide-svelte";
  import type { UserProfileResponse } from "$lib/types/domains/user-types.js";

  interface Props {
    profile?: UserProfileResponse;
    onEditProfile: () => void;
  }

  let { profile, onEditProfile }: Props = $props();
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold text-gray-900">Profile</h2>

  <!-- Profile Card -->
  <div
    class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
  >
    <button
      onclick={onEditProfile}
      class="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition-colors hover:bg-gray-50"
    >
      <div class="flex items-center space-x-3">
        <div class="relative">
          {#if profile?.profile?.profileImageUrl}
            <img
              src={profile.profile.profileImageUrl}
              alt="Profile"
              class="h-10 w-10 rounded-full object-cover"
            />
          {:else}
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100"
            >
              <Users size={20} class="text-purple-600" />
            </div>
          {/if}
        </div>
        <div>
          <div class="font-medium text-gray-900">
            {profile?.profile?.displayName ||
              profile?.user?.name ||
              "Your Profile"}
          </div>
          <div class="text-sm text-gray-600">
            Edit profile, photo, and basic information
          </div>
        </div>
      </div>
      <ChevronRight size={20} class="text-gray-400" />
    </button>
  </div>
</div>
