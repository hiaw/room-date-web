<script lang="ts">
  import { api } from "../../../convex/_generated/api.js";
  import { useConvexClient } from "convex-svelte";

  interface Props {
    imageKey: string;
    alt?: string;
    class?: string;
    expiresInSeconds?: number;
  }

  let {
    imageKey,
    alt = "Image",
    class: className = "",
    expiresInSeconds = 900, // 15 minutes default
  }: Props = $props();

  // Generate URL when component mounts
  const convex = useConvexClient();
  let imageUrl = $state<string | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Generate URL when component mounts or imageKey changes, and set up automatic refresh
  $effect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function loadImageUrlWithRefresh() {
      try {
        loading = true;
        error = null;
        const url = await convex.mutation(api.imageStorage.getImageUrl, {
          key: imageKey,
          expiresInSeconds,
        });
        imageUrl = url;

        // Refresh the URL 60 seconds before it expires to be safe
        const refreshInMs = (expiresInSeconds - 60) * 1000;
        if (refreshInMs > 0) {
          timeoutId = setTimeout(loadImageUrlWithRefresh, refreshInMs);
        }
      } catch (err) {
        console.error("Error loading image URL:", err);
        error = err instanceof Error ? err.message : "Failed to load image";
      } finally {
        loading = false;
      }
    }

    // Only load if we have an imageKey
    if (imageKey) {
      loadImageUrlWithRefresh();
    } else {
      // Handle case where imageKey is falsy to prevent infinite loading
      loading = false;
      imageUrl = null;
      error = null;
    }

    // Cleanup function to clear timeout when component unmounts or imageKey changes
    return () => {
      clearTimeout(timeoutId);
    };
  });
</script>

{#if loading}
  <div class="flex items-center justify-center bg-gray-100 {className}">
    <div
      class="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"
    ></div>
  </div>
{:else if error}
  <div
    class="flex items-center justify-center bg-gray-100 text-gray-500 {className}"
  >
    <span class="text-sm">Failed to load image</span>
  </div>
{:else if imageUrl}
  <img src={imageUrl} {alt} class={className} />
{:else}
  <div
    class="flex items-center justify-center bg-gray-100 text-gray-500 {className}"
  >
    <span class="text-sm">No image</span>
  </div>
{/if}
