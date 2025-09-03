<script lang="ts">
  import { X, Crown } from "lucide-svelte";
  import type { EventParticipant } from "../../types/domains/events";

  interface Props {
    participants: EventParticipant[];
    eventTitle?: string;
    onClose: () => void;
  }

  let { participants, eventTitle, onClose }: Props = $props();

  function getUserInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getDisplayName(participant: EventParticipant): string {
    return (
      participant.profile?.displayName ||
      participant.user?.name ||
      "Unknown User"
    );
  }

  // Sort participants: owner first, then alphabetically
  let sortedParticipants = $derived(
    [...participants].sort((a, b) => {
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (a.role !== "owner" && b.role === "owner") return 1;
      return getDisplayName(a).localeCompare(getDisplayName(b));
    }),
  );
</script>

<!-- Modal Backdrop -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  onclick={onClose}
  onkeydown={(e) => e.key === "Escape" && onClose()}
  role="button"
  tabindex="0"
>
  <!-- Modal Content -->
  <div
    class="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    role="dialog"
    tabindex="0"
  >
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Participants</h2>
        {#if eventTitle}
          <p class="text-sm text-gray-600">{eventTitle}</p>
        {/if}
      </div>
      <button
        onclick={onClose}
        class="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <X size={20} />
      </button>
    </div>

    <!-- Participants List -->
    <div class="max-h-96 space-y-3 overflow-y-auto">
      {#each sortedParticipants as participant (participant._id)}
        <div
          class="flex items-center space-x-3 rounded-xl p-3 transition-colors hover:bg-gray-50"
        >
          <!-- Avatar -->
          <div class="flex-shrink-0">
            {#if participant.profile?.profileImageUrl}
              <img
                src={participant.profile.profileImageUrl}
                alt={getDisplayName(participant)}
                class="h-10 w-10 rounded-full object-cover"
              />
            {:else}
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
              >
                <span class="text-sm font-medium text-white">
                  {getUserInitials(getDisplayName(participant))}
                </span>
              </div>
            {/if}
          </div>

          <!-- User Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center space-x-2">
              <p class="truncate font-medium text-gray-900">
                {getDisplayName(participant)}
              </p>
              {#if participant.role === "owner"}
                <Crown size={16} class="text-amber-500" />
              {/if}
            </div>
            <p class="text-sm text-gray-600">
              {participant.role === "owner" ? "Event Host" : "Participant"}
            </p>
          </div>
        </div>
      {/each}

      {#if participants.length === 0}
        <div class="py-8 text-center">
          <p class="text-gray-500">No participants found</p>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="mt-6 flex justify-end">
      <button
        onclick={onClose}
        class="rounded-xl bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
      >
        Close
      </button>
    </div>
  </div>
</div>
