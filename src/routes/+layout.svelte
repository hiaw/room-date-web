<script lang="ts">
  import { PUBLIC_CONVEX_URL } from "$env/static/public";
  import { setupConvex, useConvexClient } from "convex-svelte";
  import { onMount } from "svelte";
  import { setupConvexAuth } from "$lib/convex-auth.js";
  import AppLayout from "$lib/components/AppLayout.svelte";
  import "../app.css";

  const { children } = $props();

  // Setup Convex
  setupConvex(PUBLIC_CONVEX_URL);

  onMount(() => {
    const convex = useConvexClient();
    setupConvexAuth(convex);
  });
</script>

<AppLayout>
  {@render children()}
</AppLayout>
