<script lang="ts">
  import { useQuery } from "convex-svelte";
  import { api } from "../../convex/_generated/api.js";
  import {
    CreditCard,
    Plus,
    History,
    AlertCircle,
    ArrowLeft,
  } from "lucide-svelte";
  import Button from "./ui/Button.svelte";
  import CreditPurchase from "./CreditPurchase.svelte";

  let creditBalance = useQuery(api.credits.getCreditBalance, {});
  let balance = $derived(creditBalance?.data);
  let loading = $derived(creditBalance?.isLoading ?? true);

  let creditTransactions = useQuery(api.credits.getCreditTransactions, {
    limit: 10,
  });
  let transactions = $derived(creditTransactions?.data ?? []);

  let activeCreditHolds = useQuery(api.credits.getActiveCreditHolds, {});
  let holds = $derived(activeCreditHolds?.data ?? []);

  let showPurchaseModal = $state(false);

  function formatCreditValue(credits: number): string {
    return `$${(credits * 5).toFixed(0)}`;
  }

  function formatTransactionType(type: string): string {
    switch (type) {
      case "purchase":
        return "Purchase";
      case "deduction":
        return "Used";
      case "refund":
        return "Refund";
      case "initial_grant":
        return "Welcome Bonus";
      case "hold":
        return "Hold";
      case "release":
        return "Released";
      default:
        return type;
    }
  }

  function formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  function openPurchaseModal() {
    showPurchaseModal = true;
  }

  function closePurchaseModal() {
    showPurchaseModal = false;
  }
</script>

{#if showPurchaseModal}
  <!-- Purchase Modal -->
  <div class="space-y-6">
    <div class="flex items-center space-x-3">
      <button
        onclick={closePurchaseModal}
        class="flex items-center space-x-2 text-purple-600 hover:text-purple-700"
      >
        <ArrowLeft size={20} />
        <span>Back to Dashboard</span>
      </button>
    </div>
    <CreditPurchase />
  </div>
{:else}
  <div class="space-y-6">
    <!-- Credit Balance Card -->
    <div
      class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
    >
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <CreditCard class="h-6 w-6 text-purple-600" />
          <h3 class="text-lg font-semibold text-gray-900">
            Connection Credits
          </h3>
        </div>
        <Button variant="primary" size="sm" onclick={openPurchaseModal}>
          <Plus size={16} />
          <span>Buy Credits</span>
        </Button>
      </div>

      {#if loading}
        <div class="animate-pulse space-y-4">
          <div class="h-8 w-1/3 rounded bg-gray-200"></div>
          <div class="h-4 w-2/3 rounded bg-gray-200"></div>
        </div>
      {:else if balance}
        <div class="space-y-4">
          <div>
            <div class="text-3xl font-bold text-gray-900">
              {balance.availableCredits}
            </div>
            <div class="text-sm text-gray-600">
              Available credits ({formatCreditValue(balance.availableCredits)})
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div class="font-medium text-gray-700">Held</div>
              <div class="text-gray-600">{balance.heldCredits} credits</div>
            </div>
            <div>
              <div class="font-medium text-gray-700">Total Used</div>
              <div class="text-gray-600">{balance.totalUsed} credits</div>
            </div>
          </div>

          {#if balance.availableCredits === 0}
            <div
              class="flex items-center space-x-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3"
            >
              <AlertCircle class="h-5 w-5 text-yellow-600" />
              <div class="text-sm text-yellow-800">
                You're out of credits! Purchase more to create new events.
              </div>
            </div>
          {/if}

          {#if holds.length > 0}
            <div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div class="mb-2 text-sm font-medium text-blue-800">
                Active Holds
              </div>
              {#each holds as hold (hold._id)}
                <div class="text-xs text-blue-700">
                  {hold.creditsHeld - hold.creditsUsed} credits held for event
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <div class="py-8 text-center">
          <div class="text-gray-600">No credit information available</div>
        </div>
      {/if}
    </div>

    <!-- Transaction History -->
    <div
      class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
    >
      <div class="mb-4 flex items-center space-x-3">
        <History class="h-6 w-6 text-gray-600" />
        <h3 class="text-lg font-semibold text-gray-900">Recent Transactions</h3>
      </div>

      {#if transactions.length === 0}
        <div class="py-8 text-center text-gray-600">No transactions yet</div>
      {:else}
        <div class="space-y-3">
          {#each transactions as transaction (transaction._id)}
            <div
              class="flex items-center justify-between border-b border-gray-100 py-3 last:border-b-0"
            >
              <div class="flex-1">
                <div class="font-medium text-gray-900">
                  {formatTransactionType(transaction.type)}
                </div>
                <div class="text-sm text-gray-600">
                  {transaction.description}
                </div>
                <div class="text-xs text-gray-500">
                  {formatDate(transaction.timestamp)}
                </div>
              </div>
              <div class="text-right">
                <div
                  class="font-semibold {transaction.amount > 0
                    ? 'text-green-600'
                    : 'text-red-600'}"
                >
                  {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                </div>
                <div class="text-xs text-gray-500">
                  {formatCreditValue(Math.abs(transaction.amount))}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}
