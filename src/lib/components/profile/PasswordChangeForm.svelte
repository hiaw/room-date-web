<script lang="ts">
  import { validatePassword } from "$lib/utils/validation.js";
  import { Eye, EyeOff } from "lucide-svelte";
  import Button from "../ui/Button.svelte";
  import ErrorMessage from "../ui/ErrorMessage.svelte";

  interface Props {
    onSubmit: (newPassword: string) => Promise<void>;
    loading?: boolean;
    error?: string | null;
    onCancel?: () => void;
  }

  let { onSubmit, loading = false, error = null, onCancel }: Props = $props();

  let newPassword = $state("");
  let confirmPassword = $state("");
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);
  let validationErrors = $state<string[]>([]);

  // Password strength validation
  let passwordValidation = $derived(validatePassword(newPassword));
  let passwordsMatch = $derived(
    newPassword === confirmPassword && confirmPassword.length > 0,
  );

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    validationErrors = [];

    // Validate password strength
    if (!passwordValidation.valid) {
      validationErrors = passwordValidation.errors;
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      validationErrors = ["Passwords do not match"];
      return;
    }

    await onSubmit(newPassword);

    // Reset form on success (if no error)
    if (!error) {
      newPassword = "";
      confirmPassword = "";
    }
  }

  function toggleShowNewPassword() {
    showNewPassword = !showNewPassword;
  }

  function toggleShowConfirmPassword() {
    showConfirmPassword = !showConfirmPassword;
  }
</script>

<div class="space-y-4">
  <form onsubmit={handleSubmit} class="space-y-4">
    {#if validationErrors.length > 0 || error}
      <ErrorMessage message={error || validationErrors.join(", ")} />
    {/if}

    <!-- New Password -->
    <div>
      <label
        for="new-password"
        class="mb-2 block text-sm font-medium text-gray-700"
      >
        New Password
      </label>
      <div class="relative">
        <input
          id="new-password"
          type={showNewPassword ? "text" : "password"}
          bind:value={newPassword}
          disabled={loading}
          required
          placeholder="Enter new password"
          class="w-full rounded-xl border border-gray-200 py-3 pr-12 pl-4 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
        />
        <button
          type="button"
          onclick={toggleShowNewPassword}
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          {#if showNewPassword}
            <EyeOff size={18} />
          {:else}
            <Eye size={18} />
          {/if}
        </button>
      </div>

      <!-- Password strength indicator -->
      {#if newPassword.length > 0}
        <div class="mt-2 space-y-1">
          <div class="text-xs">
            <div class="flex space-x-1">
              {#each Array(4) as _, i}
                <div
                  class="h-1 flex-1 rounded"
                  class:bg-red-200={passwordValidation.errors.length > 3}
                  class:bg-orange-200={passwordValidation.errors.length === 2 ||
                    passwordValidation.errors.length === 3}
                  class:bg-yellow-200={passwordValidation.errors.length === 1}
                  class:bg-green-400={passwordValidation.valid && i < 4}
                  class:bg-gray-200={!passwordValidation.valid &&
                    i >= 4 - passwordValidation.errors.length}
                ></div>
              {/each}
            </div>
            <p class="mt-1 text-xs text-gray-500">
              {#if passwordValidation.valid}
                <span class="text-green-600">Strong password ✓</span>
              {:else}
                Password strength: {passwordValidation.errors.length > 3
                  ? "Weak"
                  : passwordValidation.errors.length > 1
                    ? "Fair"
                    : "Good"}
              {/if}
            </p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Confirm Password -->
    <div>
      <label
        for="confirm-password"
        class="mb-2 block text-sm font-medium text-gray-700"
      >
        Confirm New Password
      </label>
      <div class="relative">
        <input
          id="confirm-password"
          type={showConfirmPassword ? "text" : "password"}
          bind:value={confirmPassword}
          disabled={loading}
          required
          placeholder="Confirm new password"
          class="w-full rounded-xl border border-gray-200 py-3 pr-12 pl-4 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
        />
        <button
          type="button"
          onclick={toggleShowConfirmPassword}
          class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          {#if showConfirmPassword}
            <EyeOff size={18} />
          {:else}
            <Eye size={18} />
          {/if}
        </button>
      </div>

      <!-- Password match indicator -->
      {#if confirmPassword.length > 0}
        <p class="mt-1 text-xs">
          {#if passwordsMatch}
            <span class="text-green-600">Passwords match ✓</span>
          {:else}
            <span class="text-red-600">Passwords do not match</span>
          {/if}
        </p>
      {/if}
    </div>

    <!-- Buttons -->
    <div class="flex space-x-3 pt-4">
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
        disabled={loading || !passwordValidation.valid || !passwordsMatch}
        {loading}
        class="flex-1 bg-purple-600 text-white hover:bg-purple-700"
      >
        Change Password
      </Button>
    </div>
  </form>
</div>
