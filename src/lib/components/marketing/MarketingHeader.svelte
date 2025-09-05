<script lang="ts">
  import { Heart, Menu, X } from "lucide-svelte";
  import { page } from "$app/stores";

  let showMobileMenu = $state(false);
  let currentPath = $derived($page.url.pathname);

  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
  }

  function closeMobileMenu() {
    showMobileMenu = false;
  }

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "FAQ", path: "/faq" },
    { label: "Privacy", path: "/privacy" },
    { label: "Terms", path: "/terms" },
  ];

  function isActivePath(path: string): boolean {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  }
</script>

<header
  class="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md"
>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <!-- Logo -->
      <a
        href="/"
        class="flex items-center space-x-2 transition-colors hover:opacity-80"
      >
        <Heart class="h-7 w-7 fill-purple-600 text-purple-600" />
        <span
          class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent"
        >
          Room Dates
        </span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden items-center space-x-8 md:flex">
        {#each navLinks as link (link.path)}
          <a
            href={link.path}
            class="text-sm font-medium transition-colors {isActivePath(
              link.path,
            )
              ? 'text-purple-600'
              : 'text-gray-600 hover:text-purple-600'}"
          >
            {link.label}
          </a>
        {/each}
      </nav>

      <!-- Desktop CTA -->
      <div class="hidden items-center space-x-4 md:flex">
        <a
          href="/auth"
          class="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          Get Started
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button
        onclick={toggleMobileMenu}
        class="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
      >
        {#if showMobileMenu}
          <X size={24} />
        {:else}
          <Menu size={24} />
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if showMobileMenu}
    <div
      class="border-t border-gray-100 bg-white/95 backdrop-blur-md md:hidden"
    >
      <div class="space-y-1 px-4 py-4">
        {#each navLinks as link (link.path)}
          <a
            href={link.path}
            onclick={closeMobileMenu}
            class="block w-full rounded-lg px-3 py-2 text-left text-base font-medium transition-colors {isActivePath(
              link.path,
            )
              ? 'bg-purple-50 text-purple-600'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}"
          >
            {link.label}
          </a>
        {/each}
        <div class="pt-4">
          <a
            href="/auth"
            onclick={closeMobileMenu}
            class="block w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-center text-base font-medium text-white shadow-lg transition-all hover:scale-105"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  {/if}
</header>
