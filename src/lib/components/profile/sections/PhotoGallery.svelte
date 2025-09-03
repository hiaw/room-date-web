<script lang="ts">
  import { Plus } from "lucide-svelte";
  import R2Image from "../../ui/R2Image.svelte";
  import type { UserProfile } from "../../../types";

  interface Props {
    profile: UserProfile | null;
    onEditProfile: () => void;
  }

  let { profile, onEditProfile }: Props = $props();
</script>

{#if profile?.profileImages && profile.profileImages.length > 0}
  <div
    class="overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
  >
    <div class="border-b border-gray-100 px-8 py-6">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600"
          >
            <!-- Photo icon or count -->
            <span class="text-lg font-medium text-white"
              >{profile.profileImages.length}</span
            >
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Photo Gallery</h3>
            <p class="text-sm text-gray-500">
              {profile.profileImages.length} photos
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        {#each profile.profileImages.slice(0, 6) as imageKey, index (index)}
          <button
            class="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 transition-all duration-300 hover:scale-105 hover:border-pink-300 hover:shadow-lg"
          >
            <R2Image
              {imageKey}
              alt="Profile photo {index + 1}"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              expiresInSeconds={3600}
            />
          </button>
        {/each}

        {#if profile.profileImages.length < 6}
          <button
            class="group flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all duration-300 hover:border-pink-300 hover:bg-pink-50"
            onclick={onEditProfile}
          >
            <Plus
              class="h-8 w-8 text-gray-400 transition-colors group-hover:text-pink-500"
            />
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div
    class="overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
  >
    <div class="px-8 py-12 text-center">
      <div class="mb-6 flex justify-center">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600"
        >
          <Plus class="h-8 w-8 text-white" />
        </div>
      </div>
      <h3 class="mb-2 text-lg font-semibold text-gray-900">Add Photos</h3>
      <p class="mb-6 text-gray-500">Share more about yourself with photos</p>
      <button
        class="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/25"
        onclick={onEditProfile}
      >
        Add Photos
      </button>
    </div>
  </div>
{/if}
