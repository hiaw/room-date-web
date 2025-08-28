<script lang="ts">
  import { Calendar, MapPin, Camera } from "lucide-svelte";

  import type { UserProfile } from "../../../types";

  interface Props {
    profile: UserProfile | null;
    age?: number | null;
    location: string;
    onEditProfile: () => void;
  }

  let { profile, age, location, onEditProfile }: Props = $props();
</script>

<div
  class="rounded-3xl border border-white/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm"
>
  <div class="text-center">
    <!-- Profile Photo -->
    <div class="relative mb-6">
      {#if profile?.profileImageUrl}
        <img
          src={profile.profileImageUrl}
          alt="Profile"
          class="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
        />
      {:else}
        <div
          class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg"
        >
          <span class="text-2xl font-semibold text-white">
            {profile?.displayName?.charAt(0).toUpperCase() || "?"}
          </span>
        </div>
      {/if}

      <button
        onclick={onEditProfile}
        class="absolute right-1/2 bottom-0 translate-x-1/2 translate-y-2 transform rounded-full bg-purple-600 p-2 text-white transition-colors hover:bg-purple-700"
        title="Change photo"
      >
        <Camera size={16} />
      </button>
    </div>

    <!-- Basic Info -->
    <h2 class="mb-2 text-2xl font-bold text-gray-900">
      {profile?.displayName || "Anonymous User"}
    </h2>

    <div class="mb-4 flex items-center justify-center space-x-4 text-gray-600">
      {#if age}
        <span class="flex items-center space-x-1">
          <Calendar size={16} />
          <span>{age} years old</span>
        </span>
      {/if}
      {#if location}
        <span class="flex items-center space-x-1">
          <MapPin size={16} />
          <span>{location}</span>
        </span>
      {/if}
    </div>

    {#if profile?.bio}
      <p class="leading-relaxed text-gray-700">
        {profile.bio}
      </p>
    {/if}
  </div>
</div>
