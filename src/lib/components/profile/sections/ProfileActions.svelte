<script lang="ts">
  import { Edit3, Settings } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";

  interface Props {
    onEditProfile: () => void;
    onPreferences: () => void;
  }

  let { onEditProfile, onPreferences }: Props = $props();
</script>

<div class="flex space-x-4">
  <Button onclick={onEditProfile} variant="primary" class="flex-1">
    <Edit3 size={18} />
    Edit Profile
  </Button>
  <Button onclick={onPreferences} variant="secondary" class="flex-1">
    <Settings size={18} />
    Preferences
  </Button>
</div>
