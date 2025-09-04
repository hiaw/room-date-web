<script lang="ts">
  import { Heart, Smartphone, Monitor } from "lucide-svelte";
  import { goto } from "$app/navigation";

  function navigateTo(path: string) {
    goto(path);
  }

  // TODO: Replace with actual app store URLs when available
  const appStoreUrl = "#"; // "https://apps.apple.com/app/room-dates/id123456789"
  const playStoreUrl = "#"; // "https://play.google.com/store/apps/details?id=com.roomdates.app"
</script>

<footer class="border-t border-gray-200 bg-white">
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
      <!-- Brand -->
      <div class="md:col-span-2">
        <div class="mb-4 flex items-center space-x-2">
          <Heart class="h-6 w-6 fill-purple-600 text-purple-600" />
          <span
            class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-lg font-bold text-transparent"
          >
            Room Dates
          </span>
        </div>
        <p class="mb-6 max-w-md text-gray-600">
          Connect through shared experiences and create meaningful
          relationships. Host events in your space or discover amazing
          experiences in your area.
        </p>

        <!-- App Store Links -->
        <div class="space-y-3">
          <p class="text-sm font-medium text-gray-900">Download the app:</p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <a
              href={appStoreUrl}
              class="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-black px-4 py-2.5 text-white transition-colors hover:bg-gray-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Smartphone size={20} />
              <div class="text-left">
                <div class="text-xs">Download on the</div>
                <div class="text-sm font-semibold">App Store</div>
              </div>
            </a>

            <a
              href={playStoreUrl}
              class="inline-flex items-center space-x-2 rounded-lg border border-gray-300 bg-black px-4 py-2.5 text-white transition-colors hover:bg-gray-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Monitor size={20} />
              <div class="text-left">
                <div class="text-xs">Get it on</div>
                <div class="text-sm font-semibold">Google Play</div>
              </div>
            </a>
          </div>

          <p class="text-xs text-gray-500">
            Or use the web version right here in your browser!
          </p>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h3 class="mb-4 text-sm font-semibold text-gray-900">Quick Links</h3>
        <ul class="space-y-3">
          <li>
            <button
              onclick={() => navigateTo("/")}
              class="text-sm text-gray-600 transition-colors hover:text-purple-600"
            >
              Home
            </button>
          </li>
          <li>
            <button
              onclick={() => navigateTo("/about")}
              class="text-sm text-gray-600 transition-colors hover:text-purple-600"
            >
              About Us
            </button>
          </li>
          <li>
            <button
              onclick={() => navigateTo("/faq")}
              class="text-sm text-gray-600 transition-colors hover:text-purple-600"
            >
              FAQ
            </button>
          </li>
          <li>
            <button
              onclick={() => navigateTo("/auth")}
              class="text-sm text-gray-600 transition-colors hover:text-purple-600"
            >
              Sign Up
            </button>
          </li>
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <h3 class="mb-4 text-sm font-semibold text-gray-900">Legal</h3>
        <ul class="space-y-3">
          <li>
            <button
              onclick={() => navigateTo("/privacy")}
              class="text-sm text-gray-600 transition-colors hover:text-purple-600"
            >
              Privacy Policy
            </button>
          </li>
          <li>
            <button
              onclick={() => navigateTo("/terms")}
              class="text-sm text-gray-600 transition-colors hover:text-purple-600"
            >
              Terms of Service
            </button>
          </li>
        </ul>

        <!-- Contact -->
        <div class="mt-8">
          <h3 class="mb-4 text-sm font-semibold text-gray-900">Contact</h3>
          <p class="text-sm text-gray-600">
            <a
              href="mailto:support@roomdates.com"
              class="transition-colors hover:text-purple-600"
            >
              support@roomdates.com
            </a>
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="mt-12 border-t border-gray-200 pt-8">
      <div
        class="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0"
      >
        <p class="text-sm text-gray-500">
          © {new Date().getFullYear()} Room Dates. All rights reserved.
        </p>

        <div class="flex items-center space-x-6">
          <span class="text-sm text-gray-500"
            >Made with ❤️ for meaningful connections</span
          >
        </div>
      </div>
    </div>
  </div>
</footer>
