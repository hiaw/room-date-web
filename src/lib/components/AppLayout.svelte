<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import { authStore } from "$lib/stores/auth.js";
  import { getStoredToken } from "$lib/auth.js";
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { Search, Calendar, MessageCircle, User } from "lucide-svelte";
  import OfflineIndicator from "./ui/OfflineIndicator.svelte";
  import OnboardingModal from "./profile/OnboardingModal.svelte";
  import type { UserProfileResponse } from "$lib/types/domains/user-types.js";

  interface Props {
    children: import("svelte").Snippet;
  }

  let { children }: Props = $props();

  const navItems = [
    {
      id: "discover",
      path: "/discover",
      icon: Search,
      label: "Discover",
      authRequired: true,
    },
    {
      id: "my-rooms",
      path: "/my-rooms",
      icon: Calendar,
      label: "My Rooms",
      authRequired: true,
    },
    {
      id: "messages",
      path: "/messages",
      icon: MessageCircle,
      label: "Messages",
      authRequired: true,
    },
    {
      id: "profile",
      path: "/profile",
      icon: User,
      label: "Profile",
      authRequired: true,
    },
  ];

  let currentPath = $derived($page.url.pathname);
  let isAuthenticated = $derived($authStore.isAuthenticated);

  // Also check if there's a stored token for cases where auth state hasn't been restored yet
  let hasStoredToken = $state(false);

  onMount(() => {
    // Initialize auth check on mount to handle direct navigation cases
    authStore.checkExistingAuth();

    // Check for stored token to handle race conditions with auth state restoration
    if (browser) {
      hasStoredToken = !!getStoredToken();
    }
  });

  // Check if user profile is complete
  let profileQuery = $derived(
    isAuthenticated ? useQuery(api.userProfiles.getUserProfile, {}) : null,
  );
  let profile = $derived(profileQuery?.data as UserProfileResponse | undefined);
  let shouldShowOnboarding = $derived(
    isAuthenticated &&
      profile &&
      !profile?.profile?.isProfileComplete &&
      currentPath !== "/profile/edit", // Don't show if already editing profile
  );

  let showOnboardingModal = $state(false);

  // Show onboarding modal when user needs it
  $effect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (shouldShowOnboarding && !showOnboardingModal) {
      // Small delay to let the app settle
      timeoutId = setTimeout(() => {
        showOnboardingModal = true;
      }, 1000);
    }
    return () => clearTimeout(timeoutId);
  });

  function isActiveRoute(path: string): boolean {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  }

  function handleNavigation(path: string) {
    goto(path);
  }

  function handleOnboardingComplete() {
    showOnboardingModal = false;
    // Note: convex-svelte queries automatically refetch when dependencies change
  }

  function handleOnboardingClose() {
    showOnboardingModal = false;
  }

  let shouldShowBottomNav = $derived(
    (isAuthenticated || hasStoredToken) && currentPath !== "/",
  );
</script>

<div
  class="app-layout min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
>
  <!-- Offline Indicator -->
  <OfflineIndicator />

  <!-- Main Content -->
  <main class="flex-1 {shouldShowBottomNav ? 'pb-20' : ''}">
    {@render children()}
  </main>

  <!-- Onboarding Modal -->
  <OnboardingModal
    bind:open={showOnboardingModal}
    onClose={handleOnboardingClose}
    onComplete={handleOnboardingComplete}
  />

  <!-- Bottom Navigation -->
  {#if shouldShowBottomNav}
    <nav
      class="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-sm items-center justify-around px-2 py-2">
        {#each navItems as item (item.id)}
          {@const IconComponent = item.icon}
          <button
            onclick={() => handleNavigation(item.path)}
            class="group micro-bounce focus-ring flex min-h-[60px] flex-col items-center justify-center rounded-xl p-2 transition-all duration-200 {isActiveRoute(
              item.path,
            )
              ? 'scale-105 bg-purple-100 text-purple-600'
              : 'text-gray-600 hover:scale-105 hover:bg-purple-50 hover:text-purple-600'}"
            aria-label={item.label}
          >
            <IconComponent
              size={22}
              class="mb-1 transition-all duration-200 {isActiveRoute(item.path)
                ? 'stroke-2'
                : 'stroke-1.5 group-hover:rotate-12'}"
            />
            <span class="text-xs font-medium">{item.label}</span>
          </button>
        {/each}
      </div>
    </nav>
  {/if}
</div>

<style>
  .app-layout {
    min-height: 100vh;
    min-height: 100dvh;
  }
</style>
