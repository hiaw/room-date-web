<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated, authStore } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import CompactProfileDisplay from "$lib/components/profile/CompactProfileDisplay.svelte";
  import ProfileSettings from "$lib/components/profile/ProfileSettings.svelte";
  import ConnectionsWithNotes from "$lib/components/profile/ConnectionsWithNotes.svelte";
  import PasswordResetForm from "$lib/components/profile/PasswordResetForm.svelte";
  import type { UserProfileResponse } from "$lib/types/domains/user-types.js";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // State
  let showPasswordResetRequest = $state(false);

  // Reactive queries
  let profileQueryResult = useQuery(api.userProfiles.getUserProfile, {});
  let profile = $derived(
    profileQueryResult?.data as UserProfileResponse | undefined,
  );
  let loading = $derived(profileQueryResult?.isLoading ?? true);

  // Convex client for actions
  const convex = useConvexClient();

  // Password reset request state
  let passwordResetRequestLoading = $state(false);
  let passwordResetRequestError = $state<string | null>(null);

  function handleEditProfile() {
    goto("/profile/edit");
  }

  async function handleSignOut() {
    try {
      authStore.signOut();
      goto("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  function showPasswordResetRequestForm() {
    showPasswordResetRequest = true;
  }

  function hidePasswordResetRequestForm() {
    showPasswordResetRequest = false;
    passwordResetRequestError = null;
  }

  async function handlePasswordResetRequest() {
    passwordResetRequestLoading = true;
    passwordResetRequestError = null;

    try {
      // Ensure we have the user's email
      if (!profile?.user?.email) {
        throw new Error(
          "Unable to find your email address. Please try logging out and back in.",
        );
      }

      // Use the password reset flow for security
      await convex.action(api.changePassword.default, {
        email: profile.user.email,
      });

      hidePasswordResetRequestForm();
      alert(
        "Password reset email sent! Please check your email to complete the password change.",
      ); // Replace with toast notification
    } catch (error) {
      passwordResetRequestError =
        error instanceof Error
          ? error.message
          : "Failed to request password reset";
    } finally {
      passwordResetRequestLoading = false;
    }
  }
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
            Your profile, settings, and connections
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6">
    {#if showPasswordResetRequest}
      <!-- Password Reset Form -->
      <div class="mx-auto max-w-md space-y-6">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p class="mt-2 text-sm text-gray-600">
            We'll send a secure password reset link to your email address.
          </p>
        </div>

        <PasswordResetForm
          onSubmit={handlePasswordResetRequest}
          loading={passwordResetRequestLoading}
          error={passwordResetRequestError}
          onCancel={hidePasswordResetRequestForm}
          userEmail={profile?.user?.email || ""}
        />
      </div>
    {:else if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else}
      <!-- Main Profile Content -->
      <div class="mx-auto max-w-2xl space-y-6">
        <!-- 1. Profile Section -->
        <CompactProfileDisplay {profile} onEditProfile={handleEditProfile} />

        <!-- 2. Settings Section -->
        <ProfileSettings
          onPasswordReset={showPasswordResetRequestForm}
          onSignOut={handleSignOut}
        />

        <!-- 3. My Connections Section -->
        <ConnectionsWithNotes />
      </div>
    {/if}
  </div>
</div>
