<script lang="ts">
  import { Heart, MapPin } from "lucide-svelte";

  import type { UserProfile } from "../../../types";

  interface Props {
    profile: UserProfile | null;
  }

  let { profile }: Props = $props();
</script>

<div
  class="overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
>
  <div class="border-b border-gray-100 px-8 py-6">
    <h3 class="text-lg font-semibold text-gray-900">About Me</h3>
  </div>

  <div class="space-y-6 p-8">
    {#if profile}
      <!-- Bio -->
      {#if profile.bio}
        <div>
          <h4
            class="mb-2 flex items-center space-x-2 font-medium text-gray-900"
          >
            <Heart size={16} />
            <span>About</span>
          </h4>
          <p class="text-gray-700">
            {profile.bio}
          </p>
        </div>
      {/if}

      <!-- Location -->
      {#if profile.location}
        <div>
          <h4
            class="mb-2 flex items-center space-x-2 font-medium text-gray-900"
          >
            <MapPin size={16} />
            <span>Location</span>
          </h4>
          <p class="text-gray-700">
            {profile.location}
          </p>
        </div>
      {/if}
    {:else}
      <div class="text-center text-gray-500">
        <p>No profile information available</p>
      </div>
    {/if}
  </div>
</div>
