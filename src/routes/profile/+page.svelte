<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { isAuthenticated, authStore } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import CompactProfileDisplay from "$lib/components/profile/CompactProfileDisplay.svelte";
  import PasswordResetForm from "$lib/components/profile/PasswordResetForm.svelte";
  import NotificationPreferences from "$lib/components/profile/NotificationPreferences.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { Users, ChevronRight, Save, Palette, Shield } from "lucide-svelte";
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

  // Privacy settings state
  let locationSharing = $state(true);
  let displayName = $state("");
  let bio = $state("");

  // Notification settings state
  let pushNotifications = $state(true);
  let emailNotifications = $state(true);
  let messageNotifications = $state(true);
  let applicationNotifications = $state(true);
  let eventReminderNotifications = $state(true);

  let savingSettings = $state(false);

  // Initialize form when profile and settings load
  $effect(() => {
    if (profile?.profile) {
      locationSharing = profile.profile.locationSharing ?? true;
      displayName = profile.profile.displayName ?? "";
      bio = profile.profile.bio ?? "";
    }
    if (profile?.settings) {
      pushNotifications = profile.settings.pushNotifications ?? true;
      emailNotifications = profile.settings.emailNotifications ?? true;
      messageNotifications = profile.settings.messageNotifications ?? true;
      applicationNotifications =
        profile.settings.applicationNotifications ?? true;
      eventReminderNotifications =
        profile.settings.eventReminderNotifications ?? true;
    }
  });

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

  async function handleSavePrivacySettings() {
    savingSettings = true;

    try {
      await convex.mutation(api.userProfiles.updateUserProfile, {
        locationSharing,
        displayName: displayName || undefined,
        bio: bio || undefined,
      });

      alert("Privacy settings saved successfully!");
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
      alert("Failed to update privacy settings. Please try again.");
    } finally {
      savingSettings = false;
    }
  }

  async function handleSaveNotificationSettings() {
    savingSettings = true;

    try {
      await convex.mutation(api.userProfiles.updateUserSettings, {
        pushNotifications,
        emailNotifications,
        messageNotifications,
        applicationNotifications,
        eventReminderNotifications,
      });

      alert("Notification preferences saved successfully!");
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
      alert("Failed to update notification preferences. Please try again.");
    } finally {
      savingSettings = false;
    }
  }

  const settingsItems = [
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
      href: "/about",
    },
    {
      title: "Help & Support",
      href: "/help",
    },
    {
      title: "Privacy Policy",
      href: "/privacy",
    },
    {
      title: "Terms of Service",
      href: "/terms",
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
      <div class="mx-auto max-w-2xl space-y-6">
        <!-- 1. Profile Section -->
        <CompactProfileDisplay {profile} onEditProfile={handleEditProfile} />

        <!-- 2. My Connections -->
        <div
          class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
        >
          <a
            href="/connections"
            class="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition-colors hover:bg-gray-50"
          >
            <div class="flex items-center space-x-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100"
              >
                <Users size={20} class="text-purple-600" />
              </div>
              <div>
                <div class="font-medium text-gray-900">My Connections</div>
                <div class="text-sm text-gray-600">
                  Manage connections with personal notes and tags
                </div>
              </div>
            </div>
            <ChevronRight size={20} class="text-gray-400" />
          </a>
        </div>

        <!-- 4. App Preferences -->
        <div class="space-y-1">
          {#each settingsItems as item (item.id)}
            {@const IconComponent = item.icon}
            {#if item.href}
              <a
                href={item.href}
                class="flex w-full items-start space-x-4 rounded-xl px-4 py-4 text-left transition-colors hover:bg-gray-50"
              >
                <div
                  class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100"
                >
                  <IconComponent size={20} class="text-purple-600" />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="font-medium text-gray-900">{item.title}</h4>
                  <p class="text-sm text-gray-600">{item.description}</p>
                </div>
                <div class="flex items-center">
                  <svg
                    class="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </a>
            {/if}
          {/each}
        </div>

        <!-- Information -->
        <div
          class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-900">Information</h3>

          <div class="space-y-1">
            {#each infoItems as item (item.title)}
              <a
                href={item.href}
                class="block w-full rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
              >
                {item.title}
              </a>
            {/each}
          </div>
        </div>

        <!-- 5. Account Actions -->
        <div
          class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
        >
          <div class="space-y-2">
            <button
              onclick={showPasswordResetRequestForm}
              class="w-full rounded-xl px-4 py-3 text-left text-gray-700 transition-colors hover:bg-gray-50"
            >
              Reset Password
            </button>

            <div class="border-t border-gray-100 pt-2">
              <button
                onclick={handleSignOut}
                class="w-full rounded-xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
