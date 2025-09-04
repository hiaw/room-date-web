<script lang="ts">
  import { User } from "lucide-svelte";
  import type { OnboardingState } from "$lib/stores/onboarding.js";

  interface StepBasicInfoProps {
    state: OnboardingState;
    onDisplayNameChange: (value: string) => void;
    onDateOfBirthChange: (value: string) => void;
    onBioChange: (value: string) => void;
  }

  let {
    state,
    onDisplayNameChange,
    onDateOfBirthChange,
    onBioChange,
  }: StepBasicInfoProps = $props();

  // Calculate max date for date of birth (18 years ago)
  let maxDateOfBirth = $derived(() => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, 11, 31);
    return eighteenYearsAgo.toISOString().split("T")[0];
  });
</script>

<div class="space-y-4">
  <div class="flex items-center space-x-2 text-purple-600">
    <User size={20} />
    <h3 class="font-medium">Basic Information</h3>
  </div>

  <div>
    <label
      for="displayName"
      class="mb-1 block text-sm font-medium text-gray-700"
    >
      Display Name
    </label>
    <input
      id="displayName"
      value={state.displayName}
      onchange={(e) => onDisplayNameChange(e.currentTarget.value)}
      type="text"
      placeholder="How should others see your name?"
      class="w-full rounded-lg border {state.validationErrors.displayName
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'} px-3 py-2 focus:ring-1 focus:outline-none"
    />
    {#if state.validationErrors.displayName}
      <p class="mt-1 text-sm text-red-600">
        {state.validationErrors.displayName}
      </p>
    {/if}
  </div>

  <div>
    <label
      for="dateOfBirth"
      class="mb-1 block text-sm font-medium text-gray-700"
    >
      Date of Birth
    </label>
    <input
      id="dateOfBirth"
      value={state.dateOfBirth}
      onchange={(e) => onDateOfBirthChange(e.currentTarget.value)}
      type="date"
      max={maxDateOfBirth()}
      class="w-full rounded-lg border {state.validationErrors.dateOfBirth
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
        : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'} px-3 py-2 focus:ring-1 focus:outline-none"
    />
    {#if state.validationErrors.dateOfBirth}
      <p class="mt-1 text-sm text-red-600">
        {state.validationErrors.dateOfBirth}
      </p>
    {:else}
      <p class="mt-1 text-xs text-gray-500">Must be 18 or older</p>
    {/if}
  </div>

  <div>
    <label for="bio" class="mb-1 block text-sm font-medium text-gray-700">
      About You <span class="text-gray-400">(Optional)</span>
    </label>
    <textarea
      id="bio"
      value={state.bio}
      onchange={(e) => onBioChange(e.currentTarget.value)}
      placeholder="Tell others about yourself (optional)..."
      rows="3"
      class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
    ></textarea>
    <p class="mt-1 text-xs text-gray-500">
      This is optional - focus on photos and availability instead
    </p>
  </div>
</div>
