<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated, authStore } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { Edit3, Settings, LogOut, Lock } from "lucide-svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import ProfileHeader from "$lib/components/profile/sections/ProfileHeader.svelte";
  import ProfileDetails from "$lib/components/profile/sections/ProfileDetails.svelte";
  import PhotoGallery from "$lib/components/profile/sections/PhotoGallery.svelte";
  import ProfileActions from "$lib/components/profile/sections/ProfileActions.svelte";
  import ProfileEmpty from "$lib/components/profile/sections/ProfileEmpty.svelte";
  import PasswordChangeForm from "$lib/components/profile/PasswordChangeForm.svelte";
  import { getAgeFromBirthDate, formatLocation } from "$lib/utils/profile.js";
  import type { UserProfileResponse } from "$lib/types/domains/user-types.js";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // State
  let showSettings = $state(false);
  let showPasswordChange = $state(false);

  // Reactive queries
  let profileQueryResult = useQuery(api.userProfiles.getUserProfile, {});
  let profile = $derived(
    profileQueryResult.data as UserProfileResponse | undefined,
  );
  let loading = $derived(profileQueryResult.isLoading);

  // Convex client for actions
  const convex = useConvexClient();

  // Password change state
  let passwordChangeLoading = $state(false);
  let passwordChangeError = $state<string | null>(null);

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

  function showPasswordChangeForm() {
    showPasswordChange = true;
    showSettings = false;
  }

  function hidePasswordChangeForm() {
    showPasswordChange = false;
    passwordChangeError = null;
  }

  async function handlePasswordChange(newPassword: string) {
    passwordChangeLoading = true;
    passwordChangeError = null;

    try {
      await convex.action(api.changePassword.changePassword, {
        newPassword,
      });

      hidePasswordChangeForm();
      alert("Password changed successfully!"); // Replace with toast notification
    } catch (error) {
      passwordChangeError =
        error instanceof Error ? error.message : "Failed to change password";
    } finally {
      passwordChangeLoading = false;
    }
  }

  let age = $derived(
    profile?.profile?.dateOfBirth
      ? getAgeFromBirthDate(profile.profile.dateOfBirth)
      : null,
  );
  let location = $derived(
    profile?.profile ? formatLocation(profile.profile) : "",
  );
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
          onclick={showPasswordChangeForm}
          class="flex w-full items-center space-x-2 rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Lock size={18} />
          <span>Change Password</span>
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

        <!-- Divider -->
        <div class="border-t border-gray-100 pt-3">
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
            onclick={handleSignOut}
            class="flex w-full items-center space-x-2 rounded-xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Content -->
  <div class="px-4 py-6">
    {#if showPasswordChange}
      <!-- Password Change Form -->
      <div class="mx-auto max-w-md space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900">Change Password</h2>
          <p class="mt-2 text-sm text-gray-600">
            Enter a new password for your account
          </p>
        </div>

        <PasswordChangeForm
          onSubmit={handlePasswordChange}
          loading={passwordChangeLoading}
          error={passwordChangeError}
          onCancel={hidePasswordChangeForm}
        />
      </div>
    {:else if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else if !profile?.profile}
      <ProfileEmpty onSetupProfile={handleEditProfile} />
    {:else}
      <!-- Profile Content -->
      <div class="mx-auto max-w-2xl space-y-6">
        <!-- Profile Header -->
        <ProfileHeader
          profile={profile?.profile}
          {age}
          {location}
          onEditProfile={handleEditProfile}
        />

        <!-- Profile Details -->
        <ProfileDetails profile={profile?.profile} />

        <!-- Photos -->
        <PhotoGallery
          profile={profile?.profile}
          onEditProfile={handleEditProfile}
        />

        <!-- Actions -->
        <ProfileActions
          onEditProfile={handleEditProfile}
          onPreferences={() => goto("/profile/preferences")}
        />
      </div>
    {/if}
  </div>
</div>
