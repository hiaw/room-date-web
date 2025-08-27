<script lang="ts">
  import SimpleAuth from "../SimpleAuth.svelte";
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
  <div class="w-full max-w-md">
    <h1 class="mb-4 text-center text-3xl font-bold text-gray-900">
      Welcome to Task Manager
    </h1>
    <p class="mb-8 text-center text-gray-600">
      Please sign in to manage your tasks
    </p>
    <SimpleAuth />
  </div>
</div>
