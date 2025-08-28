<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth.js";
  import { Search, Calendar, MessageCircle, User } from "lucide-svelte";
  import OfflineIndicator from "./ui/OfflineIndicator.svelte";

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
      id: "connections",
      path: "/connections",
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

  function isActiveRoute(path: string): boolean {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  }

  function handleNavigation(path: string) {
    goto(path);
  }

  let shouldShowBottomNav = $derived(isAuthenticated && currentPath !== "/");
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
