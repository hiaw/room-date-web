<script lang="ts">
  import { CreditCard, Package, Check } from "lucide-svelte";
  import Button from "./ui/Button.svelte";

  let selectedPackage = $state("credits_5");
  let loading = $state(false);

  const creditPackages = [
    {
      id: "credits_5",
      credits: 5,
      price: 25,
      popular: false,
    },
    {
      id: "credits_10",
      credits: 10,
      price: 45,
      popular: true,
      savings: 5,
    },
    {
      id: "credits_20",
      credits: 20,
      price: 80,
      popular: false,
      savings: 20,
    },
  ];

  function handlePurchase() {
    loading = true;

    // TODO: Implement Stripe payment integration
    console.log("Purchasing package:", selectedPackage);

    // Simulate API call
    setTimeout(() => {
      loading = false;
      alert("Payment integration coming soon!");
    }, 1000);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="text-center">
    <div class="mb-2 flex items-center justify-center space-x-2">
      <CreditCard class="h-6 w-6 text-purple-600" />
      <h2 class="text-2xl font-bold text-gray-900">Purchase Credits</h2>
    </div>
    <p class="text-gray-600">
      Each credit allows you to connect with one participant in your events
    </p>
  </div>

  <!-- Credit Packages -->
  <div class="grid gap-4 md:grid-cols-3">
    {#each creditPackages as pkg}
      <label class="relative cursor-pointer">
        <input
          type="radio"
          bind:group={selectedPackage}
          value={pkg.id}
          class="sr-only"
        />
        <div
          class="rounded-xl border-2 p-6 text-center transition-all
          {selectedPackage === pkg.id
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-200 bg-white hover:border-gray-300'}"
        >
          {#if pkg.popular}
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
              <span
                class="rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white"
              >
                Most Popular
              </span>
            </div>
          {/if}

          <div class="mb-4">
            <Package class="mx-auto mb-2 h-8 w-8 text-purple-600" />
            <div class="text-2xl font-bold text-gray-900">
              {pkg.credits} Credits
            </div>
            <div class="text-sm text-gray-600">
              ${(pkg.credits * 5).toFixed(0)} value
            </div>
          </div>

          <div class="mb-4">
            <div class="text-3xl font-bold text-gray-900">
              ${pkg.price}
            </div>
            {#if pkg.savings}
              <div class="text-sm font-medium text-green-600">
                Save ${pkg.savings}
              </div>
            {/if}
          </div>

          <div class="text-sm text-gray-600">
            ${(pkg.price / pkg.credits).toFixed(2)} per credit
          </div>

          {#if selectedPackage === pkg.id}
            <div class="absolute top-2 right-2">
              <Check class="h-5 w-5 text-purple-600" />
            </div>
          {/if}
        </div>
      </label>
    {/each}
  </div>

  <!-- Purchase Button -->
  <div class="text-center">
    <Button
      variant="primary"
      size="lg"
      onclick={handlePurchase}
      disabled={loading}
      class="min-w-48"
    >
      {#if loading}
        <div
          class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
        ></div>
      {:else}
        <CreditCard size={20} />
      {/if}
      <span>
        {#if loading}
          Processing...
        {:else}
          Purchase Credits
        {/if}
      </span>
    </Button>
  </div>

  <!-- Payment Info -->
  <div class="space-y-2 text-center text-sm text-gray-600">
    <p>✓ Secure payment processing</p>
    <p>✓ Credits never expire</p>
    <p>✓ Refund available for no-shows</p>
  </div>
</div>
