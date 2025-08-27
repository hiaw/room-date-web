<script lang="ts">
  interface Props {
    type?: "error" | "warning" | "success" | "info";
    message: string;
    dismissible?: boolean;
    onDismiss?: () => void;
  }

  let {
    type = "error",
    message,
    dismissible = false,
    onDismiss,
  }: Props = $props();

  const typeClasses = {
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
    success: "border-green-200 bg-green-50 text-green-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };
</script>

<div class="rounded-md border p-4 {typeClasses[type]}">
  <div class="flex items-start justify-between">
    <p class="text-sm">{message}</p>
    {#if dismissible && onDismiss}
      <button
        onclick={onDismiss}
        class="ml-2 text-current hover:opacity-75"
        aria-label="Dismiss"
      >
        ✕
      </button>
    {/if}
  </div>
</div>
