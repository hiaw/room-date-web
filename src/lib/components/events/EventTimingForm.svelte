<script lang="ts">
  interface Props {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    isFlexibleTiming: boolean;
    todayDateString: string;
    onStartDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
    onFlexibleTimingChange: (value: boolean) => void;
  }

  let {
    startDate,
    startTime,
    endDate,
    endTime,
    isFlexibleTiming,
    todayDateString,
    onStartDateChange,
    onStartTimeChange,
    onEndDateChange,
    onEndTimeChange,
    onFlexibleTimingChange,
  }: Props = $props();
</script>

<div class="space-y-4">
  <h2 class="text-lg font-semibold text-gray-900">Timing</h2>

  <div class="flex items-center space-x-3">
    <input
      id="flexible-timing"
      type="checkbox"
      checked={isFlexibleTiming}
      onchange={(e) =>
        onFlexibleTimingChange((e.target as HTMLInputElement).checked)}
      class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
    />
    <label for="flexible-timing" class="text-sm text-gray-700">
      Flexible timing (guests can suggest times)
    </label>
  </div>

  {#if !isFlexibleTiming}
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label
          for="startDate"
          class="mb-1 block text-sm font-medium text-gray-700"
        >
          Start Date *
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          oninput={(e) =>
            onStartDateChange((e.target as HTMLInputElement).value)}
          min={todayDateString}
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
          required={!isFlexibleTiming}
        />
      </div>

      <div>
        <label
          for="startTime"
          class="mb-1 block text-sm font-medium text-gray-700"
        >
          Start Time *
        </label>
        <input
          id="startTime"
          type="time"
          value={startTime}
          oninput={(e) =>
            onStartTimeChange((e.target as HTMLInputElement).value)}
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
          required={!isFlexibleTiming}
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label
          for="endDate"
          class="mb-1 block text-sm font-medium text-gray-700"
        >
          End Date
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          oninput={(e) => onEndDateChange((e.target as HTMLInputElement).value)}
          min={startDate || todayDateString}
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
        />
      </div>

      <div>
        <label
          for="endTime"
          class="mb-1 block text-sm font-medium text-gray-700"
        >
          End Time
        </label>
        <input
          id="endTime"
          type="time"
          value={endTime}
          oninput={(e) => onEndTimeChange((e.target as HTMLInputElement).value)}
          class="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
        />
      </div>
    </div>
  {/if}
</div>
