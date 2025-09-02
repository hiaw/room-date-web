<script lang="ts">
  import { useQuery } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { formatDistanceToNow } from "date-fns";
  import type { Doc } from "../../../convex/_generated/dataModel";

  // Use the actual event message type from Convex schema
  type EventMessage = Doc<"eventMessages">;

  interface Props {
    message: EventMessage;
  }

  let { message }: Props = $props();

  // Get current user to determine if message is from self
  let userProfileQuery = useQuery(api.userProfiles.getUserProfile, {});
  let currentUserData = $derived(userProfileQuery?.data);
  let currentUser = $derived(currentUserData?.user);
  let currentUserProfile = $derived(currentUserData?.profile);
  let isMyMessage = $derived(currentUser?._id === message.senderId);

  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true });
  }

  function getUserInitials(name: string): string {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
</script>

{#if message.messageType === "system"}
  <!-- System Message -->
  <div class="flex justify-center py-2">
    <div class="rounded-full bg-gray-100 px-3 py-1">
      <p class="text-xs text-gray-600">{message.content}</p>
    </div>
  </div>
{:else}
  <!-- Regular Message -->
  <div class="flex {isMyMessage ? 'justify-end' : 'justify-start'}">
    <div
      class="flex max-w-[80%] space-x-2 {isMyMessage
        ? 'flex-row-reverse space-x-reverse'
        : 'flex-row'}"
    >
      <!-- Avatar -->
      {#if !isMyMessage}
        <div class="flex-shrink-0">
          {#if message.senderProfileImageUrl}
            <img
              src={message.senderProfileImageUrl}
              alt={message.senderDisplayName}
              class="h-8 w-8 rounded-full object-cover"
            />
          {:else}
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
            >
              <span class="text-xs font-medium text-white">
                {getUserInitials(message.senderDisplayName)}
              </span>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Message Bubble -->
      <div class="flex flex-col {isMyMessage ? 'items-end' : 'items-start'}">
        <!-- Sender Name (only for others) -->
        {#if !isMyMessage}
          <div class="mb-1 ml-2">
            <span class="text-xs font-medium text-gray-600"
              >{message.senderDisplayName}</span
            >
          </div>
        {/if}

        <!-- Message Content -->
        <div
          class="rounded-2xl px-4 py-2 {isMyMessage
            ? 'rounded-br-sm bg-purple-600 text-white'
            : 'rounded-bl-sm border border-gray-100 bg-white text-gray-900'}"
        >
          <p class="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        <!-- Timestamp -->
        <div class="mt-1 {isMyMessage ? 'mr-2' : 'ml-2'}">
          <span class="text-xs text-gray-500"
            >{formatTime(message._creationTime)}</span
          >
        </div>
      </div>

      <!-- My Avatar -->
      {#if isMyMessage}
        <div class="flex-shrink-0">
          {#if currentUserProfile?.profileImageUrl}
            <img
              src={currentUserProfile.profileImageUrl}
              alt="You"
              class="h-8 w-8 rounded-full object-cover"
            />
          {:else}
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600"
            >
              <span class="text-xs font-medium text-white">
                {getUserInitials(currentUserProfile?.displayName || "You")}
              </span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}
