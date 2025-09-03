<script lang="ts">
  import ImageUploader from "$lib/components/ui/ImageUploader.svelte";

  interface Props {
    images: string[];
    onImagesChange: (images: string[]) => void;
  }

  let { images, onImagesChange }: Props = $props();
</script>

<div class="space-y-4">
  <h2 class="text-lg font-semibold text-gray-900">Room Photos</h2>
  <p class="text-sm text-gray-600">
    Add photos of your room to help people see what makes it special. The first
    photo will be the main room image.
  </p>
  <ImageUploader
    {images}
    maxImages={8}
    {onImagesChange}
    label="Add Room Photos"
    folder="rooms"
  />
</div>
