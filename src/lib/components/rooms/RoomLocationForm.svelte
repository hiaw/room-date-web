<script lang="ts">
  import { MapPin } from "lucide-svelte";

  interface Props {
    streetAddress: string;
    city: string;
    stateLocation: string;
    zipCode: string;
    country: string;
    locationLoading: boolean;
    onStreetAddressChange: (value: string) => void;
    onCityChange: (value: string) => void;
    onStateLocationChange: (value: string) => void;
    onZipCodeChange: (value: string) => void;
    onCountryChange: (value: string) => void;
    onGetCurrentLocation: () => void;
  }

  let {
    streetAddress,
    city,
    stateLocation,
    zipCode,
    country,
    locationLoading,
    onStreetAddressChange,
    onCityChange,
    onStateLocationChange,
    onZipCodeChange,
    onCountryChange,
    onGetCurrentLocation,
  }: Props = $props();
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-semibold text-gray-900">Location</h2>
    <button
      type="button"
      onclick={onGetCurrentLocation}
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
      value={streetAddress}
      oninput={(e) =>
        onStreetAddressChange((e.target as HTMLInputElement).value)}
      placeholder="123 Main Street"
      class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
      required
    />
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="city" class="mb-1 block text-sm font-medium text-gray-700">
        City *
      </label>
      <input
        id="city"
        type="text"
        value={city}
        oninput={(e) => onCityChange((e.target as HTMLInputElement).value)}
        placeholder="San Francisco"
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
        required
      />
    </div>

    <div>
      <label
        for="stateLocation"
        class="mb-2 block text-sm font-medium text-gray-700"
      >
        State / Province
      </label>
      <input
        id="stateLocation"
        type="text"
        value={stateLocation}
        oninput={(e) =>
          onStateLocationChange((e.target as HTMLInputElement).value)}
        placeholder="CA"
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
      />
    </div>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label for="zipCode" class="mb-1 block text-sm font-medium text-gray-700">
        ZIP/Postal Code
      </label>
      <input
        id="zipCode"
        type="text"
        value={zipCode}
        oninput={(e) => onZipCodeChange((e.target as HTMLInputElement).value)}
        placeholder="94102"
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
      />
    </div>

    <div>
      <label for="country" class="mb-1 block text-sm font-medium text-gray-700">
        Country
      </label>
      <input
        id="country"
        type="text"
        value={country}
        oninput={(e) => onCountryChange((e.target as HTMLInputElement).value)}
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
      />
    </div>
  </div>
</div>
