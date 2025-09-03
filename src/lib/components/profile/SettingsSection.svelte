<script lang="ts">
  import { ChevronRight } from "lucide-svelte";
  import type { ComponentType, SvelteComponent } from "svelte";

  interface SettingsItem {
    id: string;
    title: string;
    description: string;
    icon: ComponentType<SvelteComponent>;
    href: string;
  }

  interface Props {
    settingsItems: SettingsItem[];
  }

  let { settingsItems }: Props = $props();
</script>

<div class="space-y-4">
  <h2 class="text-xl font-semibold text-gray-900">Settings</h2>

  <!-- App Preferences -->
  <div
    class="rounded-2xl border border-white/50 bg-white/90 p-6 backdrop-blur-sm"
  >
    <div class="space-y-1">
      {#each settingsItems as item (item.id)}
        {@const IconComponent = item.icon}
        {#if item.href}
          <a
            href={item.href}
            class="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left transition-colors hover:bg-gray-50"
          >
            <div class="flex items-center space-x-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100"
              >
                <IconComponent size={20} class="text-purple-600" />
              </div>
              <div>
                <div class="font-medium text-gray-900">
                  {item.title}
                </div>
                <div class="text-sm text-gray-600">
                  {item.description}
                </div>
              </div>
            </div>
            <ChevronRight size={20} class="text-gray-400" />
          </a>
        {/if}
      {/each}
    </div>
  </div>
</div>
