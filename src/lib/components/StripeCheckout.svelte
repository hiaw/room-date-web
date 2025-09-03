<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    clientSecret: string;
    onSuccess: () => void;
    onError: (error: string) => void;
    onCancel: () => void;
  }

  let { clientSecret, onSuccess, onError, onCancel }: Props = $props();

  let stripe = $state<any>(null);
  let elements = $state<any>(null);
  let paymentElement: HTMLDivElement;
  let loading = $state(false);
  let errorMessage = $state("");

  onMount(async () => {
    try {
      // Load Stripe.js
      const { loadStripe } = await import("@stripe/stripe-js");
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

      if (!publishableKey) {
        onError("Stripe publishable key is not configured");
        return;
      }

      stripe = await loadStripe(publishableKey);

      if (!stripe) {
        onError("Failed to load Stripe");
        return;
      }

      // Create Elements instance
      elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#7c3aed",
          },
        },
      });

      // Create and mount Payment Element
      const paymentElementComponent = elements.create("payment");
      paymentElementComponent.mount(paymentElement);
    } catch (error) {
      console.error("Stripe setup error:", error);
      onError("Failed to setup payment form");
    }
  });

  async function handleSubmit() {
    if (!stripe || !elements) {
      onError("Payment system not ready");
      return;
    }

    loading = true;
    errorMessage = "";

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/credits?success=true`,
        },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          errorMessage = error.message || "Payment failed";
        } else {
          errorMessage = "An unexpected error occurred";
        }
        onError(errorMessage);
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error("Payment error:", error);
      onError("Payment failed");
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="rounded-lg border border-gray-200 p-6">
    <h3 class="mb-4 text-lg font-semibold text-gray-900">Payment Details</h3>

    <!-- Payment Element will be mounted here -->
    <div bind:this={paymentElement}></div>

    {#if errorMessage}
      <div class="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
        {errorMessage}
      </div>
    {/if}
  </div>

  <div class="flex space-x-4">
    <button
      onclick={handleSubmit}
      disabled={loading || !stripe}
      class="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {#if loading}
        <div class="flex items-center justify-center space-x-2">
          <div
            class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
          ></div>
          <span>Processing...</span>
        </div>
      {:else}
        Complete Payment
      {/if}
    </button>

    <button
      onclick={onCancel}
      disabled={loading}
      class="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      Cancel
    </button>
  </div>
</div>
