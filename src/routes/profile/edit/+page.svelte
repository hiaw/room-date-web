<script lang="ts">
  import { onMount } from "svelte";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Save } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import ImageUploader from "$lib/components/ui/ImageUploader.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Fetch current profile
  let profileQuery = useQuery(api.userProfiles.getUserProfile, {});
  let profile = $derived(profileQuery?.data);
  let loading = $derived(profileQuery?.isLoading ?? true);

  // Update profile mutation
  let updateProfile = useMutation(api.userProfiles.updateUserProfile);

  // Form state
  let displayName = $state("");
  let bio = $state("");
  let dateOfBirth = $state("");
  let location = $state("");
  let profileImages = $state<string[]>([]);
  let saving = $state(false);

  // Initialize form when profile loads
  $effect(() => {
    if (profile) {
      displayName = profile.displayName || "";
      bio = profile.bio || "";
      dateOfBirth = profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
        : "";
      location = profile.location || "";
      profileImages = profile.profileImages || [];
    }
  });

  async function handleSave(event: Event) {
    event.preventDefault();

    if (!displayName.trim()) {
      alert("Please enter your display name");
      return;
    }

    saving = true;

    try {
      const updateData: Record<string, unknown> = {
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        profileImages,
        profileImageUrl: profileImages[0] || undefined, // First image as primary
        isProfileComplete: true,
      };

      if (dateOfBirth) {
        updateData.dateOfBirth = new Date(dateOfBirth).getTime();
      }

      await updateProfile(updateData);
      goto("/profile");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      saving = false;
    }
  }

  function handleBack() {
    if (profile?.isProfileComplete) {
      goto("/profile");
    } else {
      goto("/");
    }
  }

  function calculateAge(birthDate: string) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  }
</script>

<svelte:head>
  <title>Edit Profile - Room Dates</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <button
          onclick={handleBack}
          class="rounded-xl bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 class="text-xl font-bold text-gray-900">Edit Profile</h1>
        <button
          onclick={handleSave}
          disabled={saving || !displayName.trim()}
          class="flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {#if saving}
            <div
              class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
          {:else}
            <Save size={16} />
          {/if}
          <span>Save</span>
        </button>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else}
    <div class="mx-auto max-w-2xl px-4 py-6">
      <form onsubmit={handleSave} class="space-y-6">
        <!-- Profile Photos -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Profile Photos</h2>
          <p class="text-sm text-gray-600">
            Add up to 6 photos to show your personality. The first photo will be
            your main profile picture.
          </p>
          <ImageUploader
            images={profileImages}
            maxImages={6}
            onImagesChange={(newImages) => (profileImages = newImages)}
            label="Add Profile Photos"
          />
        </div>

        <!-- Basic Information -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label
              for="displayName"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              bind:value={displayName}
              placeholder="How should people know you?"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              for="bio"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Bio
            </label>
            <textarea
              id="bio"
              bind:value={bio}
              placeholder="Tell us about yourself, your interests, what you're looking for..."
              rows="4"
              class="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label
              for="dateOfBirth"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              bind:value={dateOfBirth}
              max={new Date(new Date().getFullYear() - 18, 11, 31)
                .toISOString()
                .split("T")[0]}
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            />
            {#if dateOfBirth}
              <p class="mt-1 text-sm text-gray-500">
                Age: {calculateAge(dateOfBirth)} years old
              </p>
            {/if}
          </div>

          <div>
            <label
              for="location"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              bind:value={location}
              placeholder="City, State"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            />
          </div>
        </div>

        <!-- Submit Button (Mobile) -->
        <div class="pt-6 lg:hidden">
          <Button
            onclick={handleSave}
            disabled={saving || !displayName.trim()}
            class="w-full"
          >
            {#if saving}
              <div
                class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              ></div>
            {/if}
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  {/if}
</div>
