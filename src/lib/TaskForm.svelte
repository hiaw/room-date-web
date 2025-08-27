<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { api } from "../convex/_generated/api.js";
  import { sanitizeTaskText } from "./utils/sanitization.js";

  let taskText = "";
  let loading = false;
  let error = "";

  const convex = useConvexClient();

  // Reactive character count based on sanitized text for consistency
  $: sanitizedLength = taskText ? sanitizeTaskText(taskText).length : 0;
  $: charactersRemaining = 1000 - sanitizedLength;
  $: isOverLimit = sanitizedLength > 1000;

  async function handleSubmit() {
    const sanitizedText = sanitizeTaskText(taskText);

    if (!sanitizedText) {
      error = "Please enter a task";
      return;
    }

    if (sanitizedText.length > 1000) {
      error =
        "Task text cannot exceed 1000 characters after removing special characters";
      return;
    }

    loading = true;
    error = "";

    try {
      await convex.mutation(api.tasks.create, { text: sanitizedText });
      taskText = ""; // Reset form
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to create task";
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="mb-8">
  {#if error}
    <div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
      <p class="text-sm text-red-700">{error}</p>
    </div>
  {/if}

  <div class="flex gap-3">
    <div class="flex-1">
      <input
        type="text"
        bind:value={taskText}
        placeholder="Enter a new task..."
        disabled={loading}
        maxlength="1000"
        class="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 {isOverLimit
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
          : ''}"
      />
      <div
        class="mt-1 text-right text-xs {isOverLimit
          ? 'text-red-600'
          : 'text-gray-500'}"
      >
        {charactersRemaining} characters remaining (after removing special characters)
      </div>
    </div>
    <button
      type="submit"
      disabled={loading || !taskText.trim() || isOverLimit}
      class="rounded-md bg-green-600 px-6 py-2 font-medium whitespace-nowrap text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      {loading ? "Adding..." : "Add Task"}
    </button>
  </div>
</form>
