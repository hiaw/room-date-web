<script lang="ts">
  import type { EventStatistics } from "../../../types/events.js";

  interface Props {
    statistics: EventStatistics;
  }

  let { statistics }: Props = $props();
</script>

<div
  class="rounded-3xl border border-white/50 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
>
  <h3 class="mb-4 text-lg font-semibold text-gray-900">Event Statistics</h3>

  <div class="grid grid-cols-2 gap-4">
    <div class="rounded-lg bg-purple-50 p-4 text-center">
      <p class="text-2xl font-bold text-purple-600">
        {statistics.applicationCount}
      </p>
      <p class="text-sm text-purple-600">Applications</p>
    </div>

    <div class="rounded-lg bg-blue-50 p-4 text-center">
      <p class="text-2xl font-bold text-blue-600">
        {statistics.pendingApplicationCount}
      </p>
      <p class="text-sm text-blue-600">Pending</p>
    </div>
  </div>
</div>
