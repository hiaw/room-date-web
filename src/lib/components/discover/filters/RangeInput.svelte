<script lang="ts">
  interface Props {
    label: string;
    min: number;
    max: number;
    minValue: number;
    maxValue: number;
    minPlaceholder?: string;
    maxPlaceholder?: string;
    onMinChange: (value: number) => void;
    onMaxChange: (value: number) => void;
  }

  let {
    label,
    min,
    max,
    minValue,
    maxValue,
    minPlaceholder = "Min",
    maxPlaceholder = "Max",
    onMinChange,
    onMaxChange,
  }: Props = $props();
</script>

<div>
  <span class="mb-2 block text-sm font-medium text-gray-700">
    {label}: {minValue} - {maxValue}
  </span>
  <div class="flex items-center space-x-4">
    <input
      type="number"
      {min}
      {max}
      value={minValue}
      oninput={(e) => onMinChange(parseInt(e.currentTarget.value))}
      class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
      placeholder={minPlaceholder}
      aria-label={`Minimum ${label.toLowerCase()}`}
    />
    <span class="text-gray-500">to</span>
    <input
      type="number"
      {min}
      {max}
      value={maxValue}
      oninput={(e) => onMaxChange(parseInt(e.currentTarget.value))}
      class="w-20 rounded-lg border border-gray-300 p-2 text-sm"
      placeholder={maxPlaceholder}
      aria-label={`Maximum ${label.toLowerCase()}`}
    />
  </div>
</div>
