<script lang="ts">
  import { isLowCreditBalance, formatCreditCount } from "$lib/utils/credits.js";
  import type { CreditBalance } from "$lib/utils/credits.js";

  interface CreditWarningProps {
    creditBalance?: CreditBalance;
  }

  let { creditBalance }: CreditWarningProps = $props();

  let showWarning = $derived(isLowCreditBalance(creditBalance));
</script>

{#if showWarning && creditBalance}
  <div class="rounded-lg border border-orange-200 bg-orange-50 p-4">
    <div class="flex items-start space-x-2">
      <div class="mt-0.5 h-2 w-2 rounded-full bg-orange-400"></div>
      <div class="text-sm text-orange-700">
        <p class="mb-1 font-medium">Limited Credits Available</p>
        <p>
          You have {formatCreditCount(creditBalance.availableCredits)} available.
          Each credit allows one guest to join your event.
          <a href="/credits" class="underline hover:no-underline"
            >Buy more credits</a
          >
          to host larger events.
        </p>
      </div>
    </div>
  </div>
{/if}
