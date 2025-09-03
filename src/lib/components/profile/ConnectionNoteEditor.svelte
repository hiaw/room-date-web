<script lang="ts">
  import { X, Save } from "lucide-svelte";
  import type { Id } from "../../../convex/_generated/dataModel";
  import type { ConnectionNoteData } from "$lib/types/domains/connections.js";

  interface Props {
    connectionId: Id<"connections">;
    currentNickname?: string;
    currentNotes?: string;
    currentTags?: string[];
    otherUserName: string;
    isOpen: boolean;
    onSave: (data: ConnectionNoteData) => Promise<void>;
    onClose: () => void;
  }

  let {
    connectionId, // eslint-disable-line @typescript-eslint/no-unused-vars
    currentNickname = "",
    currentNotes = "",
    currentTags = [],
    otherUserName,
    isOpen = false,
    onSave,
    onClose,
  }: Props = $props();

  let nickname = $state(currentNickname);
  let notes = $state(currentNotes);
  let tagInput = $state("");
  let tags = $state([...currentTags]);
  let saving = $state(false);

  // Reset form when props change
  $effect(() => {
    nickname = currentNickname;
    notes = currentNotes;
    tags = [...currentTags];
  });

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      tags = [...tags, tagInput.trim()];
      tagInput = "";
    }
  }

  function removeTag(tagToRemove: string) {
    tags = tags.filter((tag) => tag !== tagToRemove);
  }

  function handleTagKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  }

  async function handleSave() {
    saving = true;
    try {
      await onSave({
        nickname: nickname.trim(),
        notes: notes.trim(),
        tags: tags,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save connection note:", error);
      // Could add error handling here
    } finally {
      saving = false;
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- Modal Overlay -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === "Escape" && onClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-white/20 bg-white/95 p-6 backdrop-blur-md"
      role="document"
    >
      <!-- Header -->
      <div class="mb-4 flex items-center justify-between">
        <h2 id="modal-title" class="text-lg font-semibold text-gray-900">
          Notes for {otherUserName}
        </h2>
        <button
          onclick={onClose}
          class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Nickname -->
        <div>
          <label
            for="nickname"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Custom Name
          </label>
          <input
            id="nickname"
            type="text"
            bind:value={nickname}
            placeholder="How do you prefer to call them?"
            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <!-- Notes -->
        <div>
          <label
            for="notes"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Personal Notes
          </label>
          <textarea
            id="notes"
            bind:value={notes}
            placeholder="Remember details about this person..."
            rows="4"
            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
          ></textarea>
        </div>

        <!-- Tags -->
        <div>
          <label
            for="tag-input"
            class="mb-1 block text-sm font-medium text-gray-700"
          >
            Tags
          </label>
          <div class="space-y-2">
            <input
              id="tag-input"
              type="text"
              bind:value={tagInput}
              onkeydown={handleTagKeyDown}
              placeholder="Add tags (work, friend, hobby, etc.)"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />

            {#if tags.length > 0}
              <div class="flex flex-wrap gap-2">
                {#each tags as tag, i (tag + i)}
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-700"
                  >
                    {tag}
                    <button
                      onclick={() => removeTag(tag)}
                      class="text-purple-500 hover:text-purple-700"
                    >
                      <X size={12} />
                    </button>
                  </span>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex space-x-3">
        <button
          onclick={onClose}
          class="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onclick={handleSave}
          disabled={saving}
          class="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {#if saving}
            <div
              class="h-4 w-4 animate-spin rounded-full border-2 border-purple-300 border-t-white"
            ></div>
          {:else}
            <Save size={16} />
            <span>Save</span>
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
