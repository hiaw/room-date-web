<script lang="ts">
  interface Props {
    children: import("svelte").Snippet;
    class?: string;
  }

  let { children, class: className = "" }: Props = $props();
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-lg {className}">
  {@render children()}
</div>
