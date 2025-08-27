<script lang="ts">
  import { validateAuthForm } from "../../utils/validation.js";
  import Button from "../ui/Button.svelte";
  import ErrorMessage from "../ui/ErrorMessage.svelte";
  import OAuthButton from "./OAuthButton.svelte";

  interface Props {
    onSubmit: (email: string, password: string, name?: string) => Promise<void>;
    isSignUp?: boolean;
    loading?: boolean;
    error?: string | null;
  }

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
<div class="space-y-3">
  <OAuthButton provider="google" disabled={loading} />
</div>

<!-- Divider -->
<div class="relative my-6">
  <div class="absolute inset-0 flex items-center">
    <div class="w-full border-t border-gray-300"></div>
  </div>
  <div class="relative flex justify-center text-sm">
    <span class="bg-white px-2 text-gray-500">Or continue with email</span>
  </div>
</div>

<!-- Email/Password Form -->
<form onsubmit={handleSubmit} class="space-y-4">
  {#if validationErrors.length > 0}
    <ErrorMessage message={validationErrors.join(", ")} />
  {/if}

  {#if isSignUp}
    <div>
      <label for="name" class="mb-1 block text-sm font-medium text-gray-700">
        Name (optional):
      </label>
      <input
        id="name"
        type="text"
        bind:value={name}
        disabled={loading}
        placeholder="Your name"
        class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
      />
    </div>
  {/if}

  <div>
    <label for="email" class="mb-1 block text-sm font-medium text-gray-700">
      Email:
    </label>
    <input
      id="email"
      type="email"
      bind:value={email}
      disabled={loading}
      required
      placeholder="your@email.com"
      class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
    />
  </div>

  <div>
    <label for="password" class="mb-1 block text-sm font-medium text-gray-700">
      Password:
    </label>
    <input
      id="password"
      type="password"
      bind:value={password}
      disabled={loading}
      required
      placeholder="Your password"
      class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
    />
  </div>

  <Button type="submit" disabled={loading} {loading} class="w-full">
    {isSignUp ? "Sign Up" : "Sign In"} with Email
  </Button>
</form>
