<script lang="ts">
  import { CreditCard, Package, Check } from "lucide-svelte";
  import Button from "./ui/Button.svelte";
  import { useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import { authStore } from "$lib/stores/auth.js";

  let selectedPackage = $state("credits_10");
  let loading = $state(false);

  const convex = useConvexClient();

  const creditPackages = [
    {
      id: "credits_1",
      credits: 1,
      price: 5,
      popular: false,
    },
    {
      id: "credits_10",
      credits: 10,
      price: 44,
      popular: true,
      savings: 6, // 12% discount (50-44=6)
    },
    {
      id: "credits_100",
      credits: 100,
      price: 400,
      popular: false,
      savings: 100, // 20% discount (500-400=100)
    },
  ];

  async function handlePurchase() {
    if (!$authStore.isAuthenticated) {
      alert("Please sign in to purchase credits");
      return;
    }

    const selectedPkg = creditPackages.find(
      (pkg) => pkg.id === selectedPackage,
    );
    if (!selectedPkg) {
      return;
    }

    loading = true;

    try {
      // Create checkout session with our backend
      const checkoutSession = await convex.action(
        api.payments.createCheckoutSession,
        {
          credits: selectedPkg.credits,
          amount: selectedPkg.price * 100, // Convert to cents
          currency: "usd",
        },
      );

      if (checkoutSession.success && checkoutSession.url) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutSession.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("💥 Payment error:", error);
      alert(
        `❌ Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      loading = false;
    }
  }
</script>

<!-- Credit Package Selection -->
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
    {#each creditPackages as pkg (pkg.id)}
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
          Setting up payment...
        {:else}
          Purchase Credits
        {/if}
      </span>
    </Button>
  </div>

  <!-- Payment Info -->
  <div class="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
    <div class="flex items-start space-x-2">
      <div
        class="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-200"
      >
        <span class="text-xs font-bold">!</span>
      </div>
      <div>
        <p class="mb-2 font-medium">Refund Policy:</p>
        <ul class="space-y-1 text-xs">
          <li>• <strong>No money refunds</strong> after credit purchase</li>
          <li>• Credits are refunded only if your date doesn't show up</li>
          <li>• Credits never expire and can be used anytime</li>
          <li>• Secure payment processing with Stripe</li>
        </ul>
      </div>
    </div>
  </div>
</div>
