<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated, authStore } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import PasswordResetForm from "$lib/components/profile/PasswordResetForm.svelte";
  import ProfileSection from "$lib/components/profile/ProfileSection.svelte";
  import SocialSection from "$lib/components/profile/SocialSection.svelte";
  import SettingsSection from "$lib/components/profile/SettingsSection.svelte";
  import SupportSection from "$lib/components/profile/SupportSection.svelte";
  import AccountSection from "$lib/components/profile/AccountSection.svelte";
  import { Palette, Shield, CreditCard } from "lucide-svelte";
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
      await convex.action(api.auth.signIn, {
        provider: "password",
        params: {
          email: profile.user.email,
          flow: "reset",
        },
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

  const settingsItems = [
    {
      id: "credits",
      title: "Credits",
      description: "Manage your credits and purchase more",
      icon: CreditCard,
      href: "/credits",
    },
    {
      id: "preferences",
      title: "App Preferences",
      description: "Discovery, theme, and other preferences",
      icon: Palette,
      href: "/profile/preferences",
    },
    {
      id: "privacy",
      title: "Privacy Settings",
      description: "Data and visibility preferences",
      icon: Shield,
      href: "/settings/privacy",
    },
  ];

  const infoItems = [
    {
      title: "About Room Dates",
      href: "/about?from=profile",
    },
    {
      title: "Help & Support",
      href: "/help?from=profile",
    },
    {
      title: "Privacy Policy",
      href: "/privacy?from=profile",
    },
    {
      title: "Terms of Service",
      href: "/terms?from=profile",
    },
  ];
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
            Your profile and personal settings
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
      <div class="mx-auto max-w-2xl space-y-8">
        <ProfileSection {profile} onEditProfile={handleEditProfile} />
        <SocialSection />
        <SettingsSection {settingsItems} />
        <SupportSection {infoItems} />
        <AccountSection
          onPasswordReset={showPasswordResetRequestForm}
          onSignOut={handleSignOut}
        />
      </div>
    {/if}
  </div>
</div>
