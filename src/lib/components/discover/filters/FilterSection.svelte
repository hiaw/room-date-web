<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    class?: string;
    children: Snippet;
  }

  let { title, class: className = "", children }: Props = $props();
</script>

<div class="space-y-3 {className}">
  <span class="mb-3 block text-sm font-medium text-gray-700">
    {title}
  </span>
  {@render children()}
</div>
