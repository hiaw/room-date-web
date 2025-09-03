<script lang="ts">
  import { ChevronRight } from "lucide-svelte";

  interface InfoItem {
    title: string;
    href: string;
  }

  interface Props {
    infoItems: InfoItem[];
  }

  let { infoItems }: Props = $props();
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold text-gray-900">Support</h2>

  <div
    class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
  >
    <div class="space-y-1">
      {#each infoItems as item (item.title)}
        <a
          href={item.href}
          class="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors hover:bg-gray-50"
        >
          <div class="font-medium text-gray-700">{item.title}</div>
          <ChevronRight size={16} class="text-gray-400" />
        </a>
      {/each}
    </div>
  </div>
</div>
