<script lang="ts">
  import { Lock, Eye, EyeOff, Mail } from "lucide-svelte";
  import Button from "../ui/Button.svelte";
  import ErrorMessage from "../ui/ErrorMessage.svelte";

  interface Props {
    onSubmit: (email: string, newPassword: string) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
    success?: boolean;
  }

  let {
    onSubmit,
    onCancel,
    loading = false,
    error = null,
    success = false,
  }: Props = $props();

  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);
  let validationErrors = $state<string[]>([]);

  function validateForm(): string[] {
    const errors: string[] = [];

    if (!email.trim()) {
      errors.push("Email address is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Please enter a valid email address");
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (password !== confirmPassword) {
      errors.push("Passwords do not match");
    }

    return errors;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    validationErrors = validateForm();
    if (validationErrors.length > 0) {
      return;
    }

    await onSubmit(email.trim(), password);
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function toggleConfirmPasswordVisibility() {
    showConfirmPassword = !showConfirmPassword;
  }
</script>

<div class="space-y-6">
  <div class="text-center">
    <div
      class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100"
    >
      <Lock class="h-6 w-6 text-purple-600" />
    </div>
    <h2 class="mt-4 text-xl font-semibold text-gray-900">Set New Password</h2>
    <p class="mt-2 text-sm text-gray-600">
      Please enter your new password below.
    </p>
  </div>

  {#if success}
    <div class="rounded-lg border border-green-200 bg-green-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <Lock class="h-5 w-5 text-green-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Password Updated!</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>
              Your password has been successfully updated. You can now sign in
              with your new password.
            </p>
          </div>
        </div>
      </div>
    </div>

    <Button type="button" onclick={onCancel} class="w-full">
      Continue to Sign In
    </Button>
  {:else}
    <form onsubmit={handleSubmit} class="space-y-4">
      {#if error}
        <ErrorMessage message={error} />
      {/if}

      {#if validationErrors.length > 0}
        <ErrorMessage message={validationErrors.join(", ")} />
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
            placeholder="Enter the email address you used to request the reset"
            class="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
          />
        </div>
        <p class="mt-1 text-xs text-gray-500">
          This must match the email you used to request the password reset
        </p>
      </div>

      <div>
        <label
          for="new-password"
          class="mb-2 block text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <div class="relative">
          <Lock
            class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
          />
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            bind:value={password}
            disabled={loading}
            required
            placeholder="Enter your new password"
            class="w-full rounded-xl border border-gray-200 py-3 pr-12 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
          />
          <button
            type="button"
            onclick={togglePasswordVisibility}
            class="absolute top-1/2 right-3 -translate-y-1/2 transform p-1 text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            {#if showPassword}
              <EyeOff class="h-4 w-4" />
            {:else}
              <Eye class="h-4 w-4" />
            {/if}
          </button>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          Must be at least 8 characters long
        </p>
      </div>

      <div>
        <label
          for="confirm-password"
          class="mb-2 block text-sm font-medium text-gray-700"
        >
          Confirm New Password
        </label>
        <div class="relative">
          <Lock
            class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
          />
          <input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            bind:value={confirmPassword}
            disabled={loading}
            required
            placeholder="Confirm your new password"
            class="w-full rounded-xl border border-gray-200 py-3 pr-12 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
          />
          <button
            type="button"
            onclick={toggleConfirmPasswordVisibility}
            class="absolute top-1/2 right-3 -translate-y-1/2 transform p-1 text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            {#if showConfirmPassword}
              <EyeOff class="h-4 w-4" />
            {:else}
              <Eye class="h-4 w-4" />
            {/if}
          </button>
        </div>
      </div>

      <div class="flex space-x-3 pt-2">
        <Button
          type="button"
          onclick={onCancel}
          disabled={loading}
          variant="secondary"
          class="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !email || !password || !confirmPassword}
          {loading}
          class="flex-1"
        >
          {#if loading}
            Updating Password...
          {:else}
            Update Password
          {/if}
        </Button>
      </div>
    </form>
  {/if}
</div>
