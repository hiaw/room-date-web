<script lang="ts">
  import { Mail } from "lucide-svelte";
  import Button from "../ui/Button.svelte";
  import ErrorMessage from "../ui/ErrorMessage.svelte";

  interface Props {
    onSubmit: () => Promise<void>;
    loading?: boolean;
    error?: string | null;
    onCancel?: () => void;
    userEmail?: string;
  }

  let {
    onSubmit,
    loading = false,
    error = null,
    onCancel,
    userEmail,
  }: Props = $props();

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    await onSubmit();
  }
</script>

<div class="space-y-6">
  <div class="text-center">
    <div
      class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100"
    >
      <Mail class="h-6 w-6 text-blue-600" />
    </div>
  </div>

  <div class="space-y-2 text-center">
    <p class="text-gray-600">
      We'll send a password reset link to your email address.
    </p>
    {#if userEmail}
      <p class="text-sm font-medium text-gray-900">
        {userEmail}
      </p>
    {/if}
  </div>

  <form onsubmit={handleSubmit} class="space-y-4">
    {#if error}
      <ErrorMessage message={error} />
    {/if}

    <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <Mail class="h-5 w-5 text-blue-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">How this works</h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc space-y-1 pl-5">
              <li>We'll send a secure reset link to your email</li>
              <li>Click the link to set a new password</li>
              <li>The link expires after 24 hours for security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex space-x-3 pt-2">
      {#if onCancel}
        <Button
          type="button"
          onclick={onCancel}
          disabled={loading}
          variant="secondary"
          class="flex-1"
        >
          Cancel
        </Button>
      {/if}
      <Button
        type="submit"
        disabled={loading}
        {loading}
        class="flex-1 bg-blue-600 text-white hover:bg-blue-700"
      >
        {#if loading}
          Sending Reset Email...
        {:else}
          Send Reset Email
        {/if}
      </Button>
    </div>
  </form>
</div>
