<script lang="ts">
  import { Edit3 } from "lucide-svelte";
  import { getAgeFromBirthDate, formatLocation } from "$lib/utils/profile.js";
  import type { UserProfileResponse } from "$lib/types/domains/user-types.js";

  interface Props {
    profile: UserProfileResponse | undefined;
    onEditProfile: () => void;
  }

  let { profile, onEditProfile }: Props = $props();

  let age = $derived(
    profile?.profile?.dateOfBirth
      ? getAgeFromBirthDate(profile.profile.dateOfBirth)
      : null,
  );
  let location = $derived(
    profile?.profile ? formatLocation(profile.profile) : "",
  );

  function getUserInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
</script>

{#if profile?.profile}
  <div
    class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
  >
    <div class="flex items-center space-x-4">
      <!-- Avatar -->
      <div class="flex-shrink-0">
        {#if profile.profile.profileImageUrl}
          <img
            src={profile.profile.profileImageUrl}
            alt="Profile"
            class="h-16 w-16 rounded-full object-cover ring-2 ring-purple-100"
          />
        {:else}
          <div
            class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
          >
            <span class="text-lg font-medium text-white">
              {getUserInitials(profile.profile.displayName || "?")}
            </span>
          </div>
        {/if}
      </div>

      <!-- Profile Info -->
      <div class="min-w-0 flex-1">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="truncate text-xl font-bold text-gray-900">
            {profile.profile.displayName || "Complete Your Profile"}
          </h2>
          <button
            onclick={onEditProfile}
            class="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"
            title="Edit Profile"
          >
            <Edit3 size={18} />
          </button>
        </div>

        <div class="space-y-1 text-sm text-gray-600">
          {#if age}
            <p>{age} years old</p>
          {/if}
          {#if location}
            <p>{location}</p>
          {/if}
          {#if profile.profile.bio}
            <p class="line-clamp-2">{profile.profile.bio}</p>
          {/if}
        </div>

        {#if !profile.profile.displayName || !profile.profile.bio || !age}
          <div
            class="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700"
          >
            Complete your profile to make better connections!
          </div>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div
    class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
  >
    <div class="text-center">
      <div
        class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400"
      >
        <span class="text-lg font-medium text-white">?</span>
      </div>
      <h2 class="mb-2 text-xl font-bold text-gray-900">
        Complete Your Profile
      </h2>
      <p class="mb-4 text-sm text-gray-600">
        Add your details to start making meaningful connections.
      </p>
      <button
        onclick={onEditProfile}
        class="rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
      >
        Set Up Profile
      </button>
    </div>
  </div>
{/if}
