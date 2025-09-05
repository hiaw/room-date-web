<script lang="ts">
  import MarketingHeader from "./MarketingHeader.svelte";
  import MarketingFooter from "./MarketingFooter.svelte";

  interface Props {
    children: import("svelte").Snippet;
  }

  let { children }: Props = $props();
</script>

<div
  class="flex min-h-screen flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50"
>
  <MarketingHeader />

  <main class="flex-1">
    {@render children()}
  </main>

  <MarketingFooter />
</div>
