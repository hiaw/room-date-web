<script lang="ts">
  import { onMount } from "svelte";
  import { useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { ArrowLeft, Save, MapPin } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import ImageUploader from "$lib/components/ui/ImageUploader.svelte";

  // Get convex client - only on client side
  let convex = browser ? useConvexClient() : null;

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Form state
  let title = $state("");
  let description = $state("");
  let streetAddress = $state("");
  let city = $state("");
  let state = $state("");
  let zipCode = $state("");
  let country = $state("United States");
  let images = $state<string[]>([]);
  let saving = $state(false);
  let locationLoading = $state(false);

  async function handleSave(event: Event) {
    event.preventDefault();

    if (!convex) {
      alert("Room creation not available");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a room title");
      return;
    }

    if (title.trim().length < 3) {
      alert("Room title must be at least 3 characters long");
      return;
    }

    if (!streetAddress.trim() || !city.trim()) {
      alert("Please enter the full address");
      return;
    }

    if (!description.trim()) {
      alert("Please enter a room description");
      return;
    }

    if (description.trim().length < 10) {
      alert("Room description must be at least 10 characters long");
      return;
    }

    saving = true;

    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      // Geocode the address
      if (streetAddress && city) {
        const fullAddress = `${streetAddress}, ${city}${state ? ", " + state : ""}${zipCode ? " " + zipCode : ""}, ${country}`;
        try {
          await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(fullAddress)}&key=YOUR_API_KEY`,
          );
          // For now, use a simple geocoding approach or skip coordinates
          // In production, you'd want to use a proper geocoding service
        } catch {
          console.warn("Geocoding failed, creating room without coordinates");
        }
      }

      const roomData = {
        title: title.trim(),
        description: description.trim() || undefined,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        country: country.trim(),
        latitude,
        longitude,
        locationVerified: false,
        images,
        primaryImageUrl: images[0] || undefined,
        isActive: true,
      };

      await convex.mutation(api.rooms.createRoom, roomData);
      goto("/my-rooms");
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room. Please try again.");
    } finally {
      saving = false;
    }
  }

  function handleBack() {
    goto("/my-rooms");
  }

  async function getCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
      return;
    }

    locationLoading = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=en`,
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            streetAddress =
              `${addr.house_number || ""} ${addr.road || ""}`.trim();
            city = addr.city || addr.town || addr.village || "";
            state = addr.state || "";
            zipCode = addr.postcode || "";
            country = addr.country || "United States";
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          alert("Could not determine address from location");
        } finally {
          locationLoading = false;
        }
      },
      (error) => {
        console.error("Location error:", error);
        let errorMessage =
          "Could not get your location. Please enter address manually.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions or enter address manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please enter address manually.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. Please try again or enter address manually.";
            break;
        }

        alert(errorMessage);
        locationLoading = false;
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  }
</script>

<svelte:head>
  <title>Create Room - Room Dates</title>
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
        <h1 class="text-xl font-bold text-gray-900">Create Room</h1>
        <button
          onclick={handleSave}
          disabled={saving || !title.trim()}
          class="flex items-center space-x-2 rounded-xl bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {#if saving}
            <div
              class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
          {:else}
            <Save size={16} />
          {/if}
          <span>Create</span>
        </button>
      </div>
    </div>
  </div>

  <div class="mx-auto max-w-2xl px-4 py-6">
    <form onsubmit={handleSave} class="space-y-6">
      <!-- Room Photos -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Room Photos</h2>
        <p class="text-sm text-gray-600">
          Add photos of your room to help people see what makes it special. The
          first photo will be the main room image.
        </p>
        <ImageUploader
          {images}
          maxImages={8}
          onImagesChange={(newImages) => (images = newImages)}
          label="Add Room Photos"
        />
      </div>

      <!-- Basic Information -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-900">Room Details</h2>

        <div>
          <label
            for="title"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Room Title *
          </label>
          <input
            id="title"
            type="text"
            bind:value={title}
            placeholder="e.g. Cozy Downtown Loft, Garden Patio Space"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            for="description"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Describe your room, its atmosphere, amenities, and what makes it special for events..."
            rows="4"
            class="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
          ></textarea>
        </div>
      </div>

      <!-- Location -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Location</h2>
          <button
            type="button"
            onclick={getCurrentLocation}
            disabled={locationLoading}
            class="flex items-center space-x-2 rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-200 disabled:opacity-50"
          >
            {#if locationLoading}
              <div
                class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
              ></div>
            {:else}
              <MapPin size={16} />
            {/if}
            <span>Use Current Location</span>
          </button>
        </div>

        <div>
          <label
            for="streetAddress"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Street Address *
          </label>
          <input
            id="streetAddress"
            type="text"
            bind:value={streetAddress}
            placeholder="123 Main Street"
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="city"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              City *
            </label>
            <input
              id="city"
              type="text"
              bind:value={city}
              placeholder="San Francisco"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              for="state"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              State/Province
            </label>
            <input
              id="state"
              type="text"
              bind:value={state}
              placeholder="CA"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="zipCode"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              ZIP/Postal Code
            </label>
            <input
              id="zipCode"
              type="text"
              bind:value={zipCode}
              placeholder="94102"
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            />
          </div>

          <div>
            <label
              for="country"
              class="mb-1 block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <input
              id="country"
              type="text"
              bind:value={country}
              class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Submit Button (Mobile) -->
      <div class="pt-6 lg:hidden">
        <Button
          onclick={handleSave}
          disabled={saving || !title.trim()}
          class="w-full"
        >
          {#if saving}
            <div
              class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></div>
          {/if}
          Create Room
        </Button>
      </div>
    </form>
  </div>
</div>
