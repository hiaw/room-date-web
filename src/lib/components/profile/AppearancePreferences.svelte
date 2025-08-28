<script lang="ts">
  import { Palette } from "lucide-svelte";

  interface Props {
    theme: "light" | "dark" | "system";
    onThemeChange: (theme: "light" | "dark" | "system") => void;
  }

  let { theme, onThemeChange }: Props = $props();

  const themeOptions = [
    { value: "light" as const, label: "Light" },
    { value: "dark" as const, label: "Dark" },
    { value: "system" as const, label: "System" },
  ];
</script>

<div
  class="rounded-3xl border border-white/50 bg-white/90 shadow-sm backdrop-blur-sm"
>
  <div class="border-b border-gray-100 px-8 py-6">
    <h3 class="flex items-center space-x-2 text-lg font-semibold text-gray-900">
      <Palette size={20} />
      <span>Appearance</span>
    </h3>
    <p class="mt-1 text-sm text-gray-600">Customize how the app looks</p>
  </div>

  <div class="space-y-4 p-8">
    <fieldset>
      <legend class="block font-medium text-gray-900">Theme</legend>
      <p class="mb-4 text-sm text-gray-600">Choose your preferred theme</p>
      <div class="grid grid-cols-3 gap-3">
        {#each themeOptions as option (option.value)}
          <button
            type="button"
            onclick={() => onThemeChange(option.value)}
            class={`rounded-xl px-4 py-3 text-center transition-colors ${
              theme === option.value
                ? "bg-purple-100 text-purple-700 ring-2 ring-purple-600"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </fieldset>
  </div>
</div>
