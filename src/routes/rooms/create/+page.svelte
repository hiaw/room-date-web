<script lang="ts">
  import { onMount } from "svelte";
  import { useConvexClient } from "convex-svelte";
  import { loadApi, type ConvexAPI } from "../../../lib/convex/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { ArrowLeft, Save } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import RoomImageSection from "$lib/components/rooms/RoomImageSection.svelte";
  import RoomDetailsForm from "$lib/components/rooms/RoomDetailsForm.svelte";
  import RoomLocationForm from "$lib/components/rooms/RoomLocationForm.svelte";

  // Get convex client - only on client side
  let convex = browser ? useConvexClient() : null;

  // Import API only on client side
  let api: ConvexAPI | null = null;

  if (browser) {
    loadApi()
      .then((loadedApi) => {
        api = loadedApi;
      })
      .catch((error) => {
        console.error("Failed to load Convex API in room create page:", error);
      });
  }

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
  let stateLocation = $state("");
  let zipCode = $state("");
  let country = $state("United States");
  let images: string[] = $state([]);
  let saving = $state(false);
  let locationLoading = $state(false);
  let latitude = $state<number | undefined>(undefined);
  let longitude = $state<number | undefined>(undefined);

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
      let finalLatitude = latitude;
      let finalLongitude = longitude;

      // Try to geocode the address if we don't have coordinates
      if (!latitude || !longitude) {
        try {
          const fullAddress = `${streetAddress}, ${city}${stateLocation ? ", " + stateLocation : ""}${zipCode ? " " + zipCode : ""}, ${country}`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&accept-language=en`,
          );
          const data = await response.json();

          if (data && data[0]) {
            finalLatitude = parseFloat(data[0].lat);
            finalLongitude = parseFloat(data[0].lon);
          }
        } catch (error) {
          console.warn(
            "Geocoding failed, creating room without coordinates:",
            error,
          );
        }
      }

      const roomData = {
        title: title.trim(),
        description: description.trim() || undefined,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: stateLocation.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
        country: country.trim(),
        latitude: finalLatitude,
        longitude: finalLongitude,
        locationVerified: !!(finalLatitude && finalLongitude),
        images,
        primaryImageUrl: images[0] || undefined,
      };

      if (!api || !convex) {
        throw new Error("API or Convex client not available");
      }

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
          // Store coordinates
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;

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
            stateLocation = addr.state || "";
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

  // Event handlers for form components
  function handleImagesChange(newImages: string[]) {
    images = newImages;
  }

  function handleTitleChange(value: string) {
    title = value;
  }

  function handleDescriptionChange(value: string) {
    description = value;
  }

  function handleStreetAddressChange(value: string) {
    streetAddress = value;
  }

  function handleCityChange(value: string) {
    city = value;
  }

  function handleStateLocationChange(value: string) {
    stateLocation = value;
  }

  function handleZipCodeChange(value: string) {
    zipCode = value;
  }

  function handleCountryChange(value: string) {
    country = value;
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
      <RoomImageSection {images} onImagesChange={handleImagesChange} />

      <!-- Room Details -->
      <RoomDetailsForm
        {title}
        {description}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      />

      <!-- Location -->
      <RoomLocationForm
        {streetAddress}
        {city}
        {stateLocation}
        {zipCode}
        {country}
        {locationLoading}
        onStreetAddressChange={handleStreetAddressChange}
        onCityChange={handleCityChange}
        onStateLocationChange={handleStateLocationChange}
        onZipCodeChange={handleZipCodeChange}
        onCountryChange={handleCountryChange}
        onGetCurrentLocation={getCurrentLocation}
      />

      <!-- Coordinates Display -->
      {#if latitude && longitude}
        <div class="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 class="mb-2 text-sm font-medium text-green-800">
            Location Coordinates
          </h3>
          <p class="text-sm text-green-700">
            Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)}
          </p>
          <p class="mt-1 text-xs text-green-600">
            Your room will appear in location-based event discovery
          </p>
        </div>
      {:else}
        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h3 class="mb-2 text-sm font-medium text-yellow-800">
            Location Coordinates Missing
          </h3>
          <p class="text-sm text-yellow-700">
            Use "Get Current Location" or we'll try to get coordinates from your
            address automatically.
          </p>
        </div>
      {/if}

      <!-- Submit Button (Mobile) -->
      <div class="pt-6 lg:hidden">
        <Button
          onclick={() => handleSave(new Event("click"))}
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
