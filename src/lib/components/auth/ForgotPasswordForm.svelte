<script lang="ts">
  import { Mail } from "lucide-svelte";
  import Button from "../ui/Button.svelte";
  import ErrorMessage from "../ui/ErrorMessage.svelte";

  interface Props {
    onSubmit: (email: string) => Promise<void>;
    onBack: () => void;
    loading?: boolean;
    error?: string | null;
    success?: boolean;
  }

  let {
    onSubmit,
    onBack,
    loading = false,
    error = null,
    success = false,
  }: Props = $props();

  let email = $state("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (email.trim()) {
      await onSubmit(email.trim());
    }
  }
</script>

<div class="space-y-6">
  <div class="text-center">
    <div
      class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100"
    >
      <Mail class="h-6 w-6 text-blue-600" />
    </div>
    <h2 class="mt-4 text-xl font-semibold text-gray-900">
      Forgot your password?
    </h2>
    <p class="mt-2 text-sm text-gray-600">
      Enter your email address and we'll send you a link to reset your password.
    </p>
  </div>

  {#if success}
    <div class="rounded-lg border border-green-200 bg-green-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <Mail class="h-5 w-5 text-green-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Email sent!</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>
              Check your inbox for a password reset link. If you don't see it,
              check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>

    <Button type="button" onclick={onBack} variant="secondary" class="w-full">
      Back to Sign In
    </Button>
  {:else}
    <form onsubmit={handleSubmit} class="space-y-4">
      {#if error}
        <ErrorMessage message={error} />
      {/if}

      <div>
        <label
          for="reset-email"
          class="mb-2 block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <div class="relative">
          <Mail
            class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
          />
          <input
            id="reset-email"
            type="email"
            bind:value={email}
            disabled={loading}
            required
            placeholder="Enter your email address"
            class="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
          />
        </div>
      </div>

      <div class="flex space-x-3 pt-2">
        <Button
          type="button"
          onclick={onBack}
          disabled={loading}
          variant="secondary"
          class="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          {loading}
          class="flex-1"
        >
          {#if loading}
            Sending...
          {:else}
            Send Reset Link
          {/if}
        </Button>
      </div>
    </form>
  {/if}
</div>
