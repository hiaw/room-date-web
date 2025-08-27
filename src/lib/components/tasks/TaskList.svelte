<script lang="ts">
  import { useQuery } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import TaskItem from "./TaskItem.svelte";
  import LoadingSpinner from "../ui/LoadingSpinner.svelte";
  import ErrorMessage from "../ui/ErrorMessage.svelte";

  const tasksQuery = useQuery(api.tasks.get, {});
</script>

{#if tasksQuery.isLoading}
  <LoadingSpinner message="Loading tasks..." />
{:else if tasksQuery.error}
  <ErrorMessage message="Failed to load tasks: {tasksQuery.error.toString()}" />
{:else if tasksQuery.data?.length === 0}
  <div class="py-12 text-center">
    <div class="mb-4 text-6xl text-gray-400">📝</div>
    <h3 class="mb-2 text-lg font-medium text-gray-900">No tasks yet!</h3>
    <p class="text-gray-600">Create your first task above to get started.</p>
  </div>
{:else}
  <div class="space-y-3">
    {#each tasksQuery.data as task (task._id)}
      <TaskItem {task} />
    {/each}
  </div>
{/if}
