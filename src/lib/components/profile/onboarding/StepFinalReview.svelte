<script lang="ts">
  import { Calendar } from "lucide-svelte";
  import type { OnboardingState } from "$lib/stores/onboarding.js";

  interface StepFinalReviewProps {
    state: OnboardingState;
  }

  let { state }: StepFinalReviewProps = $props();
</script>

<div class="space-y-4">
  <div class="flex items-center space-x-2 text-purple-600">
    <Calendar size={20} />
    <h3 class="font-medium">Ready to Go!</h3>
  </div>

  <p class="text-sm text-gray-600">Your profile is ready! You can now:</p>

  <ul class="space-y-2 text-sm text-gray-700">
    <li class="flex items-center space-x-2">
      <div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
      <span>Discover events near you</span>
    </li>
    <li class="flex items-center space-x-2">
      <div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
      <span>Create your own rooms and events</span>
    </li>
    <li class="flex items-center space-x-2">
      <div class="h-1.5 w-1.5 rounded-full bg-purple-600"></div>
      <span>Connect with other users</span>
    </li>
  </ul>

  <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
    <p class="text-sm text-blue-800">
      🎉 <strong>Welcome bonus:</strong> Your profile is now complete and optimized
      for the best experience!
    </p>
  </div>

  {#if state.validationErrors.save}
    <div class="rounded-lg border border-red-200 bg-red-50 p-3">
      <p class="text-sm text-red-700">{state.validationErrors.save}</p>
    </div>
  {/if}
</div>
