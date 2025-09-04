<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { ArrowLeft } from "lucide-svelte";
  import { useConvexClient } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import Button from "$lib/components/ui/Button.svelte";
  import CreditDashboard from "$lib/components/CreditDashboard.svelte";

  let processingPayment = false;
  let paymentMessage = "";
  let paymentStatus: "success" | "error" | "" = "";

  // Create Convex client for mutations
  const convex = useConvexClient();

  function handleBack() {
    goto("/profile");
  }

  onMount(async () => {
    // Check URL parameters for payment success/cancel
    const urlParams = new URLSearchParams($page.url.searchParams);
    const success = urlParams.get("success");
    const cancelled = urlParams.get("cancelled");
    const sessionId = urlParams.get("session_id");

    if (success === "true" && sessionId) {
      await handlePaymentSuccess(sessionId);
    } else if (cancelled === "true") {
      paymentStatus = "error";
      paymentMessage = "Payment was cancelled. You can try again anytime.";
    }
  });

  async function handlePaymentSuccess(sessionId: string) {
    processingPayment = true;
    paymentMessage = "Processing your payment...";

    try {
      // SECURITY NOTE: This calls a secure backend verification action
      // that verifies payment with Stripe API server-side
      const verificationResult = await convex.action(
        api.payments.processStripeRedirect,
        {
          sessionId: sessionId,
        },
      );

      if (verificationResult.success) {
        // Create payment record if it doesn't exist and complete the payment
        await convex.mutation(api.payments.completePaymentBySessionId, {
          sessionId: sessionId,
          credits: verificationResult.creditsGranted,
          amount: verificationResult.amountTotal,
          currency: verificationResult.currency,
        });

        paymentStatus = "success";
        paymentMessage = `Payment successful! ${verificationResult.creditsGranted} credits have been added to your account.`;
      } else {
        throw new Error(
          verificationResult.message || "Payment verification failed",
        );
      }

      // Clear URL parameters after processing
      window.history.replaceState({}, document.title, "/credits");
    } catch (error) {
      console.error("Payment processing error:", error);
      paymentStatus = "error";
      paymentMessage = `Payment processing failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    } finally {
      processingPayment = false;
    }
  }
</script>

<svelte:head>
  <title>Credits - Room Dates</title>
  <meta
    name="description"
    content="Manage your Room Dates credits and purchase more to connect with people at events."
  />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center space-x-3">
        <Button variant="secondary" size="sm" onclick={handleBack} class="p-2">
          <ArrowLeft class="h-5 w-5" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Your Credits</h1>
          <p class="text-sm text-gray-600">
            Credits are used to create events and connect with people
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="container mx-auto max-w-4xl px-4 py-8">
    <!-- Payment Status Messages -->
    {#if processingPayment}
      <div class="mb-6 rounded-lg bg-blue-50 p-4">
        <div class="flex items-center">
          <div
            class="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
          ></div>
          <p class="text-blue-700">{paymentMessage}</p>
        </div>
      </div>
    {:else if paymentMessage}
      <div
        class="mb-6 rounded-lg p-4 {paymentStatus === 'success'
          ? 'bg-green-50'
          : 'bg-red-50'}"
      >
        <p
          class={paymentStatus === "success"
            ? "text-green-700"
            : "text-red-700"}
        >
          {paymentMessage}
        </p>
      </div>
    {/if}

    <CreditDashboard />
  </div>
</div>
