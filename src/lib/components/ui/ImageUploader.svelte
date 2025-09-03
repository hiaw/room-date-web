<script lang="ts">
  import { Upload, X, Camera } from "lucide-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { useConvexClient } from "convex-svelte";
  import { browser } from "$app/environment";
  import R2Image from "./R2Image.svelte";

  interface Props {
    images?: string[];
    maxImages?: number;
    onImagesChange: (images: string[]) => void;
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    label?: string;
    accept?: string;
    disabled?: boolean;
    folder?: string; // New prop for organizing uploads by folder
  }

  let {
    images = [],
    maxImages = 6,
    onImagesChange,
    onUploadStart,
    onUploadEnd,
    label = "Upload Images",
    accept = "image/*",
    disabled = false,
    folder = "general", // Default folder
  }: Props = $props();

  // Use Convex client for custom upload with folder support
  const convex = useConvexClient();
  let uploading = $state(false);
  let fileInput = $state<HTMLInputElement>();
  let uploadError = $state<string | null>(null);

  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    uploading = true;
    onUploadStart?.();

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        // Compress image before upload
        const compressedFile = await compressImage(file);

        // Get organized upload URL with folder
        const uploadResult = await convex.mutation(
          api.imageStorage.uploadToFolder,
          {
            folder,
            fileName: compressedFile.name,
          },
        );

        // Upload file to R2
        const response = await fetch(uploadResult.uploadUrl, {
          method: "PUT",
          body: compressedFile,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        // Return the organized R2 key
        return uploadResult.key;
      });

      const uploadedKeys = await Promise.all(uploadPromises);
      const validKeys = uploadedKeys.filter(
        (key): key is string => key !== null,
      );
      onImagesChange([...images, ...validKeys]);
    } catch (error) {
      console.error("Upload error:", error);
      uploadError =
        error instanceof Error
          ? error.message
          : "Failed to upload images. Please try again.";
      // Clear error after 5 seconds
      setTimeout(() => (uploadError = null), 5000);
    } finally {
      uploading = false;
      onUploadEnd?.();
      // Reset file input
      if (fileInput) fileInput.value = "";
    }
  }

  function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 800px on longest side)
        let { width, height } = img;
        const maxDimension = 800;

        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.8,
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  async function removeImage(index: number) {
    const imageKey = images[index];

    // Remove from UI immediately for better UX
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);

    // Delete from R2 bucket in background
    try {
      await convex.mutation(api.imageStorage.deleteImage, {
        key: imageKey,
      });
      console.log(`Deleted image: ${imageKey}`);
    } catch (error) {
      console.error("Failed to delete image from R2:", error);
      // Could show a warning toast here, but don't revert UI change
    }
  }

  function openFileDialog() {
    if (!disabled && !uploading) {
      fileInput?.click();
    }
  }
</script>

{#if browser}
  <div class="space-y-4">
    <input
      bind:this={fileInput}
      type="file"
      multiple
      {accept}
      class="hidden"
      onchange={handleFileSelect}
      {disabled}
    />

    <!-- Image Grid -->
    {#if images.length > 0}
      <div class="grid grid-cols-3 gap-4">
        {#each images as imageKey, index (index)}
          <div class="group relative aspect-square">
            <!-- Use R2Image component to display images with generated URLs -->
            <R2Image
              {imageKey}
              alt="Uploaded image {index + 1}"
              class="h-full w-full rounded-xl border-2 border-gray-200 object-cover"
            />
            <button
              type="button"
              onclick={() => removeImage(index)}
              class="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-red-600"
              {disabled}
            >
              <X size={14} />
            </button>
          </div>
        {/each}

        <!-- Add More Button -->
        {#if images.length < maxImages}
          <button
            type="button"
            onclick={openFileDialog}
            disabled={disabled || uploading}
            class="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {#if uploading}
              <div
                class="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"
              ></div>
            {:else}
              <Camera size={24} />
              <span class="mt-1 text-xs">Add More</span>
            {/if}
          </button>
        {/if}
      </div>
    {/if}

    <!-- Upload Button -->
    {#if images.length === 0}
      <button
        type="button"
        onclick={openFileDialog}
        disabled={disabled || uploading}
        class="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-8 text-gray-500 transition-colors hover:border-purple-400 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {#if uploading}
          <div
            class="mb-2 h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent"
          ></div>
          <span>Uploading...</span>
        {:else}
          <Upload size={32} class="mb-2" />
          <span class="font-medium">{label}</span>
          <span class="mt-1 text-sm text-gray-400">
            Select up to {maxImages} image{maxImages === 1 ? "" : "s"}
          </span>
        {/if}
      </button>
    {/if}

    <!-- Error Message -->
    {#if uploadError}
      <div class="rounded-lg border border-red-200 bg-red-50 p-3">
        <div class="flex items-center">
          <svg
            class="mr-2 h-4 w-4 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span class="text-sm text-red-700">{uploadError}</span>
        </div>
      </div>
    {/if}

    <!-- Progress indicator -->
    {#if images.length > 0 && images.length < maxImages}
      <p class="text-center text-sm text-gray-500">
        {images.length} / {maxImages} images uploaded
      </p>
    {/if}
  </div>
{/if}
