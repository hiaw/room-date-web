<script lang="ts">
  interface Props {
    variant?: "primary" | "secondary" | "danger";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
    type?: "button" | "submit";
    class?: string;
    onclick?: () => void;
    children: import("svelte").Snippet;
  }

  let {
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    type = "button",
    class: className = "",
    onclick,
    children,
  }: Props = $props();

  const baseClasses =
    "font-medium rounded-md transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-400",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-400",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };
</script>

<button
  {type}
  disabled={disabled || loading}
  {onclick}
  class="{baseClasses} {variantClasses[variant]} {sizeClasses[
    size
  ]} {className}"
>
  {#if loading}
    <div
      class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    ></div>
  {/if}
  {@render children()}
</button>
