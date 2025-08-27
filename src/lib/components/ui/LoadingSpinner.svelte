<script lang="ts">
  interface Props {
    size?: "sm" | "md" | "lg";
    message?: string;
  }

  let { size = "md", message = "Loading..." }: Props = $props();

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
</script>

<div class="flex flex-col items-center justify-center py-8">
  <div
    class="{sizeClasses[
      size
    ]} animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
  ></div>
  {#if message}
    <p class="mt-2 text-gray-600">{message}</p>
  {/if}
</div>
