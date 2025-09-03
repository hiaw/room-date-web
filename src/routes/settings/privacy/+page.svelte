<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Save } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Fetch current profile and settings
  let profileQuery = useQuery(api.userProfiles.getUserProfile, {});
  let profile = $derived(profileQuery?.data?.profile);
  let loading = $derived(profileQuery?.isLoading ?? true);

  // Convex client for mutations
  let convex = useConvexClient();

  // Privacy settings state (using existing profile fields)
  let locationSharing = $state(true);
  let displayName = $state("");
  let bio = $state("");

  let saving = $state(false);

  // Initialize form when profile loads
  $effect(() => {
    if (profile) {
      locationSharing = profile.locationSharing ?? true;
      displayName = profile.displayName ?? "";
      bio = profile.bio ?? "";
    }
  });

  async function handleSave(event: Event) {
    event.preventDefault();
    saving = true;

    try {
      await convex.mutation(api.userProfiles.updateUserProfile, {
        locationSharing,
        displayName: displayName || undefined,
        bio: bio || undefined,
      });

      goto("/settings");
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
      alert("Failed to update privacy settings. Please try again.");
    } finally {
      saving = false;
    }
  }

  function handleBack() {
    goto("/settings");
  }
</script>

<svelte:head>
  <title>Privacy Settings - Room Dates</title>
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
        <div class="flex items-center space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onclick={handleBack}
            class="p-2"
          >
            <ArrowLeft class="h-5 w-5" />
          </Button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Privacy Settings</h1>
            <p class="text-sm text-gray-600">
              Control your data and visibility
            </p>
          </div>
        </div>
        <Button
          onclick={() => handleSave(new Event("click"))}
          disabled={saving}
          class="bg-purple-600 text-white hover:bg-purple-700"
        >
          {#if saving}
            <LoadingSpinner />
          {:else}
            <Save size={16} />
          {/if}
          <span>Save</span>
        </Button>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="px-4 py-6">
    {#if loading}
      <div class="flex items-center justify-center py-16">
        <LoadingSpinner />
      </div>
    {:else}
      <form onsubmit={handleSave} class="mx-auto max-w-2xl space-y-6">
        <!-- Profile Information -->
        <div
          class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-900">
            Profile Information
          </h3>
          <p class="mb-4 text-sm text-gray-600">
            Control what information is displayed on your profile
          </p>

          <div class="space-y-4">
            <div>
              <label
                for="display-name"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Display Name
              </label>
              <input
                id="display-name"
                type="text"
                bind:value={displayName}
                placeholder="Your display name"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              />
              <p class="mt-1 text-sm text-gray-600">
                This is how your name appears to other users
              </p>
            </div>

            <div>
              <label
                for="bio"
                class="mb-2 block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                bind:value={bio}
                placeholder="Tell others about yourself..."
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-purple-500"
              ></textarea>
              <p class="mt-1 text-sm text-gray-600">
                Share a bit about yourself with potential connections
              </p>
            </div>
          </div>
        </div>

        <!-- Location Privacy -->
        <div
          class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-900">
            Location Privacy
          </h3>

          <div class="space-y-4">
            <label class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">Location Sharing</div>
                <div class="text-sm text-gray-600">
                  Allow location-based event discovery and connections
                </div>
              </div>
              <input
                type="checkbox"
                bind:checked={locationSharing}
                class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </label>
          </div>
        </div>

        <!-- Privacy Information -->
        <div
          class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
        >
          <h3 class="mb-4 text-lg font-semibold text-gray-900">
            Privacy Information
          </h3>
          <div class="space-y-3 text-sm text-gray-600">
            <p>
              • Your profile is visible to other Room Dates users when you apply
              to events or create rooms
            </p>
            <p>
              • Location data is only used for event discovery and is never
              shared with other users
            </p>
            <p>• You can update your privacy preferences at any time</p>
            <p>
              • For more details, see our <a
                href="/privacy"
                class="text-purple-600 hover:underline">Privacy Policy</a
              >
            </p>
          </div>
        </div>

        <!-- Save Button (Mobile) -->
        <div class="md:hidden">
          <Button
            type="submit"
            disabled={saving}
            class="flex w-full items-center justify-center space-x-2"
          >
            {#if saving}
              <LoadingSpinner />
            {:else}
              <Save size={16} />
            {/if}
            <span>Save Privacy Settings</span>
          </Button>
        </div>
      </form>
    {/if}
  </div>
</div>
