<script lang="ts">
  import ApplicationCard from "./ApplicationCard.svelte";
  import type { EventApplicationWithDetails } from "$lib/types/domains/events.js";

  interface Props {
    applications: EventApplicationWithDetails[];
    onViewEvent: (eventId: string) => void;
  }

  let { applications, onViewEvent }: Props = $props();
</script>

{#if applications && applications.length > 0}
  <div>
    <h2 class="mb-4 text-lg font-semibold text-gray-900">Applied Events</h2>
    <div class="space-y-3">
      {#each applications as application (application._id)}
        <ApplicationCard {application} {onViewEvent} />
      {/each}
    </div>
  </div>
{/if}
