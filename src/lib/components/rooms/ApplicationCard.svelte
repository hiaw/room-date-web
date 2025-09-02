<script lang="ts">
  import type { EventApplicationWithDetails } from "$lib/types/domains/events.js";

  interface Props {
    application: EventApplicationWithDetails;
    onViewEvent: (eventId: string) => void;
  }

  let { application, onViewEvent }: Props = $props();

  function formatApplicationDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  }
</script>

<div
  class="cursor-pointer overflow-hidden rounded-xl border border-white/50 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
  onclick={() => onViewEvent(application.eventId)}
  onkeydown={(e) =>
    e.key === "Enter" || e.key === " "
      ? onViewEvent(application.eventId)
      : null}
  role="button"
  tabindex="0"
>
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <h3 class="font-medium text-gray-900">
        {application.event?.title || "Untitled Event"}
      </h3>
      <p class="mt-1 text-sm text-gray-600">
        {application.event?.roomTitle || application.roomTitle} • Applied {formatApplicationDate(
          application._creationTime,
        )}
      </p>
      {#if application.message}
        <p class="mt-2 line-clamp-2 text-sm text-gray-500">
          "{application.message}"
        </p>
      {/if}
    </div>
    <div class="ml-4 flex flex-col items-end space-y-2">
      <span
        class="rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
          application.status,
        )}"
      >
        {getStatusText(application.status)}
      </span>
      {#if application.event?.startTime}
        <span class="text-xs text-gray-500">
          {new Date(application.event.startTime).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      {:else if application.event?.isFlexibleTiming}
        <span class="text-xs text-gray-500">Flexible timing</span>
      {/if}
    </div>
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    display: block;
    line-clamp: 2;
  }
</style>
