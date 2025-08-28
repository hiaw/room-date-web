<script lang="ts">
  import { User } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";

  interface Props {
    onSetupProfile: () => void;
  }

  let { onSetupProfile }: Props = $props();
</script>

<div class="py-16 text-center">
  <div
    class="mx-auto max-w-md rounded-3xl border border-white/50 bg-white/70 p-12 backdrop-blur-sm"
  >
    <User class="mx-auto mb-4 h-16 w-16 text-gray-400" />
    <h3 class="mb-2 text-xl font-semibold text-gray-900">
      Complete Your Profile
    </h3>
    <p class="mb-8 text-gray-600">
      Set up your profile to start connecting with people and creating events.
    </p>
    <Button onclick={onSetupProfile} class="w-full">Set Up Profile</Button>
  </div>
</div>
