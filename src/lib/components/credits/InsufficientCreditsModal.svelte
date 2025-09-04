<script lang="ts">
  import { goto } from "$app/navigation";
  import { CreditCard, X } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";

  interface Props {
    open: boolean;
    availableCredits: number;
    requiredCredits: number;
    onClose: () => void;
    onCancel?: () => void;
  }

  let { open, availableCredits, requiredCredits, onClose, onCancel }: Props =
    $props();

  let shortfall = $derived(Math.max(0, requiredCredits - availableCredits));

  function handleBuyCredits() {
    onClose();
    goto("/credits");
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  }

  function handleModalClick(e: MouseEvent) {
    // Close modal if clicking on backdrop
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      handleCancel();
    }
  }
</script>

{#if open}
  <svelte:window on:keydown={handleKeydown} />
  <!-- Modal backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onclick={handleModalClick}
  >
    <!-- Modal content -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
    >
      <!-- Close button -->
      <button
        onclick={handleCancel}
        class="absolute top-4 right-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={20} />
      </button>

      <!-- Icon -->
      <div class="mb-4 flex justify-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100"
        >
          <CreditCard class="h-8 w-8 text-orange-600" />
        </div>
      </div>

      <!-- Title -->
      <h2 id="modal-title" class="mb-2 text-center text-xl font-bold text-gray-900">
        Insufficient Credits
      </h2>

      <!-- Description -->
      <div class="mb-6 text-center text-gray-600">
        {#if availableCredits === 0}
          <p class="mb-2">
            You need credits to create events with guest limits. You currently
            have no credits available.
          </p>
          <p>
            Purchase <span class="font-semibold text-orange-600"
              >{requiredCredits}</span
            >
            {requiredCredits === 1 ? "credit" : "credits"} to create this event.
          </p>
        {:else}
          <p class="mb-2">
            You need <span class="font-semibold text-gray-900"
              >{requiredCredits}</span
            >
            {requiredCredits === 1 ? "credit" : "credits"} to create this event,
            but you only have
            <span class="font-semibold text-gray-900">{availableCredits}</span>
            {availableCredits === 1 ? "credit" : "credits"} available.
          </p>
          <p>
            You need <span class="font-semibold text-orange-600"
              >{shortfall}</span
            >
            more {shortfall === 1 ? "credit" : "credits"} to continue.
          </p>
        {/if}
      </div>

      <!-- Info box -->
      <div class="mb-6 rounded-lg bg-blue-50 p-4">
        <div class="flex items-start space-x-2">
          <div class="mt-0.5 h-2 w-2 rounded-full bg-blue-400"></div>
          <div class="text-sm text-blue-700">
            <p class="mb-1 font-medium">How credits work:</p>
            <p>
              Each credit allows one guest to join your event. If you set a
              maximum of {requiredCredits} guests, you need {requiredCredits} credits.
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col gap-3 sm:flex-row-reverse">
        <Button
          onclick={handleBuyCredits}
          class="flex items-center justify-center gap-2"
        >
          <CreditCard size={16} />
          Buy More Credits
        </Button>
        <Button variant="secondary" onclick={handleCancel} class="sm:flex-1">
          {#if availableCredits === 0}
            Go Back
          {:else}
            Cancel
          {/if}
        </Button>
      </div>
    </div>
  </div>
{/if}
