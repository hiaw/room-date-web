<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import {
    User,
    Edit3,
    Settings,
    MapPin,
    Calendar,
    Heart,
    Languages,
    Camera,
    Plus,
    LogOut,
  } from "lucide-svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import Button from "$lib/components/ui/Button.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // State
  let showSettings = $state(false);

  // Reactive queries
  let profileQueryResult = useQuery(api.userProfiles.getUserProfile, {});
  let profile = $derived(profileQueryResult.data);
  let loading = $derived(profileQueryResult.isLoading);

  function handleEditProfile() {
    goto("/profile/edit");
  }

  function toggleSettings() {
    showSettings = !showSettings;
  }

  async function handleSignOut() {
    try {
      authStore.signOut();
      goto("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  function getAgeFromBirthDate(birthDate: string): number | null {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  }

  function formatGenderIdentity(genderIdentity?: string[]): string {
    if (!genderIdentity || genderIdentity.length === 0) return "Not specified";
    return genderIdentity
      .map((g) => g.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()))
      .join(", ");
  }

  function formatLanguages(
    languages?: { language: string; proficiency?: string }[],
  ): string {
    if (!languages || languages.length === 0) return "None specified";
    return languages
      .map((l) =>
        l.proficiency ? `${l.language} (${l.proficiency})` : l.language,
      )
      .join(", ");
  }

  function formatLocation(profile: unknown): string {
    const parts = [];
    if (profile?.city) parts.push(profile.city);
    if (profile?.state) parts.push(profile.state);
    if (profile?.country) parts.push(profile.country);
    return parts.join(", ") || "Location not set";
  }

  let age = $derived(
    profile?.dateOfBirth ? getAgeFromBirthDate(profile.dateOfBirth) : null,
  );
  let location = $derived(profile ? formatLocation(profile) : "");
</script>

<svelte:head>
  <title>Profile - Room Dates</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
>
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Profile</h1>
          <p class="text-sm text-gray-600">
            Manage your account and preferences
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            onclick={handleEditProfile}
            class="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"
            title="Edit Profile"
          >
            <Edit3 size={20} />
          </button>
          <button
            onclick={toggleSettings}
            class="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-50"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Settings Panel -->
  {#if showSettings}
    <div
      class="border-b border-gray-100 bg-white/95 px-4 py-4 backdrop-blur-md"
    >
      <div class="space-y-3">
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
        <button
          onclick={handleSignOut}
          class="flex w-full items-center space-x-2 rounded-xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Content -->
  <div class="px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else if !profile}
      <!-- Profile Setup Required -->
      <div class="py-16 text-center">
        <div
          class="mx-auto max-w-md rounded-3xl border border-white/50 bg-white/70 p-12 backdrop-blur-sm"
        >
          <User class="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 class="mb-2 text-xl font-semibold text-gray-900">
            Complete Your Profile
          </h3>
          <p class="mb-8 text-gray-600">
            Set up your profile to start connecting with people and creating
            events.
          </p>
          <Button onclick={handleEditProfile} class="w-full">
            Set Up Profile
          </Button>
        </div>
      </div>
    {:else}
      <!-- Profile Content -->
      <div class="mx-auto max-w-2xl space-y-6">
        <!-- Profile Header -->
        <div
          class="rounded-3xl border border-white/50 bg-white/90 p-8 shadow-sm backdrop-blur-sm"
        >
          <div class="text-center">
            <!-- Profile Photo -->
            <div class="relative mb-6">
              {#if profile.profilePhotoUrl}
                <img
                  src={profile.profilePhotoUrl}
                  alt="Profile"
                  class="mx-auto h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
              {:else}
                <div
                  class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg"
                >
                  <span class="text-2xl font-semibold text-white">
                    {profile.displayName?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              {/if}

              <button
                onclick={handleEditProfile}
                class="absolute right-1/2 bottom-0 translate-x-1/2 translate-y-2 transform rounded-full bg-purple-600 p-2 text-white transition-colors hover:bg-purple-700"
                title="Change photo"
              >
                <Camera size={16} />
              </button>
            </div>

            <!-- Basic Info -->
            <h2 class="mb-2 text-2xl font-bold text-gray-900">
              {profile.displayName || "Anonymous User"}
            </h2>

            <div
              class="mb-4 flex items-center justify-center space-x-4 text-gray-600"
            >
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

            {#if profile.blurb}
              <p class="leading-relaxed text-gray-700">
                {profile.blurb}
              </p>
            {/if}
          </div>
        </div>

        <!-- Profile Details -->
        <div
          class="overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
        >
          <div class="border-b border-gray-100 px-8 py-6">
            <h3 class="text-lg font-semibold text-gray-900">About Me</h3>
          </div>

          <div class="space-y-6 p-8">
            <!-- Gender Identity -->
            <div>
              <h4
                class="mb-2 flex items-center space-x-2 font-medium text-gray-900"
              >
                <Heart size={16} />
                <span>Gender Identity</span>
              </h4>
              <p class="text-gray-700">
                {formatGenderIdentity(profile.genderIdentity)}
              </p>
            </div>

            <!-- Languages -->
            {#if profile.languages && profile.languages.length > 0}
              <div>
                <h4
                  class="mb-2 flex items-center space-x-2 font-medium text-gray-900"
                >
                  <Languages size={16} />
                  <span>Languages</span>
                </h4>
                <p class="text-gray-700">
                  {formatLanguages(profile.languages)}
                </p>
              </div>
            {/if}

            <!-- Height -->
            {#if profile.heightCm}
              <div>
                <h4 class="mb-2 font-medium text-gray-900">Height</h4>
                <p class="text-gray-700">
                  {profile.heightCm} cm ({Math.round(profile.heightCm / 2.54)} inches)
                </p>
              </div>
            {/if}

            <!-- Lifestyle -->
            {#if profile.smokingHabit || profile.drinkingHabit}
              <div>
                <h4 class="mb-2 font-medium text-gray-900">Lifestyle</h4>
                <div class="space-y-1 text-gray-700">
                  {#if profile.smokingHabit}
                    <p>Smoking: {profile.smokingHabit}</p>
                  {/if}
                  {#if profile.drinkingHabit}
                    <p>Drinking: {profile.drinkingHabit}</p>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Photos -->
        {#if profile.photoUrls && profile.photoUrls.length > 0}
          <div
            class="overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
          >
            <div class="border-b border-gray-100 px-8 py-6">
              <h3 class="text-lg font-semibold text-gray-900">Photos</h3>
            </div>

            <div class="p-8">
              <div class="grid grid-cols-3 gap-4">
                {#each profile.photoUrls.slice(0, 6) as photoUrl, index (index)}
                  <button
                    class="aspect-square overflow-hidden rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <img
                      src={photoUrl}
                      alt="Profile"
                      class="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </button>
                {/each}

                {#if profile.photoUrls.length < 6}
                  <button
                    onclick={handleEditProfile}
                    class="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition-colors hover:border-purple-400 hover:bg-purple-50"
                  >
                    <Plus size={24} class="text-gray-400" />
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex space-x-4">
          <Button onclick={handleEditProfile} variant="primary" class="flex-1">
            <Edit3 size={18} />
            Edit Profile
          </Button>
          <Button
            onclick={() => goto("/profile/preferences")}
            variant="secondary"
            class="flex-1"
          >
            <Settings size={18} />
            Preferences
          </Button>
        </div>
      </div>
    {/if}
  </div>
</div>
