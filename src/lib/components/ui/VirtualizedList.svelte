<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  interface Props<T> {
    items: T[];
    itemHeight: number;
    containerHeight: number;
    renderItem: Snippet<[item: T, index: number]>;
  }

  let { items, itemHeight, containerHeight, renderItem }: Props<unknown> =
    $props();

  let scrollTop = $state(0);
  let container: HTMLElement;

  // Calculate visible range
  let startIndex = $derived(Math.floor(scrollTop / itemHeight));
  let endIndex = $derived(
    Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 2, // +2 for buffer
      items.length,
    ),
  );

  let visibleItems = $derived(
    items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
    })),
  );

  let totalHeight = $derived(items.length * itemHeight);
  let offsetY = $derived(startIndex * itemHeight);

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    scrollTop = target.scrollTop;
  }

  onMount(() => {
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  });
</script>

<div
  bind:this={container}
  class="overflow-auto"
  style="height: {containerHeight}px;"
>
  <div style="height: {totalHeight}px; position: relative;">
    <div style="transform: translateY({offsetY}px);">
      {#each visibleItems as { item, index } (index)}
        <div style="height: {itemHeight}px;">
          {@render renderItem(item, index)}
        </div>
      {/each}
    </div>
  </div>
</div>
