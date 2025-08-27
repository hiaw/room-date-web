<script lang="ts">
  import AppHeader from "./AppHeader.svelte";
  import TaskForm from "../TaskForm.svelte";
  import TaskList from "./tasks/TaskList.svelte";
</script>

<div class="min-h-screen bg-gray-50">
  <AppHeader />

  <main class="mx-auto max-w-4xl px-4 py-8">
    <TaskForm />
    <TaskList />
  </main>
</div>
