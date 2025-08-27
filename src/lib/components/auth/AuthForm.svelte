<script lang="ts">
  import { validateAuthForm } from "../../utils/validation.js";
  import Button from "../ui/Button.svelte";
  import ErrorMessage from "../ui/ErrorMessage.svelte";
  import OAuthButton from "./OAuthButton.svelte";
  import { Mail, Lock, User } from "lucide-svelte";

  import type { AuthFormProps } from "$lib/types/components";

  interface Props extends AuthFormProps {}

  let {
    onSubmit,
    isSignUp = false,
    loading = false,
    error = null,
  }: Props = $props();

  let email = $state("");
  let password = $state("");
  let name = $state("");
  let validationErrors = $state<string[]>([]);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    validationErrors = validateAuthForm(email, password);

    if (validationErrors.length > 0) {
      return;
    }

    await onSubmit(email, password, isSignUp ? name : undefined);

    // Reset form on success (if no error)
    if (!error) {
      email = "";
      password = "";
      name = "";
    }
  }
</script>

<!-- OAuth Options -->
<div class="mb-6 space-y-3">
  <OAuthButton provider="google" disabled={loading} />
</div>

<!-- Divider -->
<div class="relative mb-6">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-gray-200"></div>
  </div>
  <div class="relative flex justify-center text-sm">
    <span class="bg-white px-3 font-medium text-gray-500">or</span>
  </div>
</div>

<!-- Email/Password Form -->
<form onsubmit={handleSubmit} class="space-y-4">
  {#if validationErrors.length > 0}
    <ErrorMessage message={validationErrors.join(", ")} />
  {/if}

  {#if isSignUp}
    <div>
      <label for="name" class="mb-2 block text-sm font-medium text-gray-700">
        Full Name (Optional)
      </label>
      <div class="relative">
        <User
          class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
        />
        <input
          id="name"
          type="text"
          bind:value={name}
          disabled={loading}
          placeholder="Enter your full name"
          class="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
        />
      </div>
    </div>
  {/if}

  <div>
    <label for="email" class="mb-2 block text-sm font-medium text-gray-700">
      Email Address
    </label>
    <div class="relative">
      <Mail
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
      />
      <input
        id="email"
        type="email"
        bind:value={email}
        disabled={loading}
        required
        placeholder="Enter your email"
        class="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
      />
    </div>
  </div>

  <div>
    <label for="password" class="mb-2 block text-sm font-medium text-gray-700">
      Password
    </label>
    <div class="relative">
      <Lock
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
      />
      <input
        id="password"
        type="password"
        bind:value={password}
        disabled={loading}
        required
        placeholder="Enter your password"
        class="w-full rounded-xl border border-gray-200 py-3 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50"
      />
    </div>
    {#if isSignUp}
      <p class="mt-1 text-xs text-gray-500">
        Choose a secure password with at least 8 characters
      </p>
    {/if}
  </div>

  <Button
    type="submit"
    disabled={loading}
    {loading}
    class="w-full py-3 text-base font-semibold"
  >
    {isSignUp ? "Create Account" : "Sign In"}
  </Button>
</form>
