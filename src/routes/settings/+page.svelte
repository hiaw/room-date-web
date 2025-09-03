<script lang="ts">
  import { onMount } from "svelte";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Lock, Bell, Shield, User, Palette } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";

  interface Props {
    onPasswordReset?: () => void;
    onSignOut?: () => void;
  }

  let { onPasswordReset, onSignOut }: Props = $props();

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  function handleBack() {
    goto("/profile");
  }

  function handlePasswordReset() {
    if (onPasswordReset) {
      onPasswordReset();
    } else {
      // Navigate back to profile to handle password reset
      goto("/profile?action=password-reset");
    }
  }

  function handleSignOut() {
    if (onSignOut) {
      onSignOut();
    } else {
      // Navigate back to profile to handle sign out
      goto("/profile?action=sign-out");
    }
  }

  const settingsItems = [
    {
      id: "account",
      title: "Account Settings",
      description: "Password and account security",
      icon: Lock,
      action: handlePasswordReset,
    },
    {
      id: "privacy",
      title: "Privacy Settings",
      description: "Data and visibility preferences",
      icon: Shield,
      href: "/settings/privacy",
    },
    {
      id: "notifications",
      title: "Notification Preferences",
      description: "Manage your notifications",
      icon: Bell,
      href: "/settings/notifications",
    },
    {
      id: "preferences",
      title: "App Preferences",
      description: "Discovery, theme, and other preferences",
      icon: Palette,
      href: "/profile/preferences",
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
  <title>Settings - Room Dates</title>
</svelte:head>

<div
  class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 pb-4"
>
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center space-x-3">
        <Button variant="secondary" size="sm" onclick={handleBack} class="p-2">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
          <p class="text-sm text-gray-600">
            Manage your account and preferences
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6">
    <div class="mx-auto max-w-2xl space-y-6">
      <!-- Settings Sections -->
      <div
        class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
      >
        <h3 class="mb-4 text-lg font-semibold text-gray-900">
          Account & Privacy
        </h3>

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
            {:else if item.action}
              <button
                onclick={item.action}
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
              </button>
            {/if}
          {/each}
        </div>
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

      <!-- Sign Out -->
      <div
        class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
      >
        <Button
          onclick={handleSignOut}
          variant="secondary"
          class="w-full justify-center bg-red-50 text-red-600 hover:bg-red-100"
        >
          <svg
            class="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </Button>
      </div>
    </div>
  </div>
</div>
