<script lang="ts">
  import ImageUploader from "$lib/components/ui/ImageUploader.svelte";

  interface Props {
    eventImages: string[];
    onImagesChange: (images: string[]) => void;
  }

  let { eventImages, onImagesChange }: Props = $props();
</script>

<div class="space-y-4">
  <h2 class="text-lg font-semibold text-gray-900">Event Photos</h2>
  <p class="text-sm text-gray-600">
    Add photos that capture the vibe of your event. These can be different from
    room photos.
  </p>
  <ImageUploader
    images={eventImages}
    maxImages={6}
    {onImagesChange}
    label="Add Event Photos"
  />
</div>
