<script lang="ts">
  import {
    User,
    Clock,
    Check,
    X,
    MessageCircle,
    Calendar,
  } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import type { ApplicantCardProps } from "$lib/types/components.js";

  let {
    application,
    onApprove,
    onReject,
    loading = false,
  }: ApplicantCardProps = $props();

  let showResponseForm = $state(false);
  let responseMessage = $state("");
  let actionType: "approve" | "reject" | null = $state(null);

  function getStatusColor(status: string): string {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  function formatApplicationDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function getAge(dateOfBirth?: number): number | null {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  function startAction(type: "approve" | "reject") {
    actionType = type;
    responseMessage = "";
    showResponseForm = true;
  }

  async function handleSubmitResponse() {
    if (!actionType) return;

    try {
      if (actionType === "approve") {
        await onApprove(application._id, responseMessage.trim() || undefined);
      } else {
        await onReject(application._id, responseMessage.trim() || undefined);
      }

      showResponseForm = false;
      actionType = null;
      responseMessage = "";
    } catch (error) {
      console.error("Failed to respond to application:", error);
    }
  }

  function cancelResponse() {
    showResponseForm = false;
    actionType = null;
    responseMessage = "";
  }
</script>

<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
  <div class="flex items-start justify-between">
    <div class="flex items-start space-x-4">
      <!-- Profile Image -->
      <div class="flex-shrink-0">
        {#if application.applicant?.profile?.profileImageUrl}
          <img
            src={application.applicant.profile.profileImageUrl}
            alt={application.applicant.profile?.displayName ||
              application.applicant.name ||
              "User"}
            class="h-12 w-12 rounded-full object-cover"
          />
        {:else}
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100"
          >
            <User class="h-6 w-6 text-purple-600" />
          </div>
        {/if}
      </div>

      <!-- Application Details -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center space-x-3">
          <h3 class="font-semibold text-gray-900">
            {application.applicant?.profile?.displayName ||
              application.applicant?.name ||
              "Unknown User"}
          </h3>
          {#if application.applicant?.profile?.dateOfBirth}
            <span class="text-sm text-gray-500">
              Age {getAge(application.applicant.profile.dateOfBirth)}
            </span>
          {/if}
        </div>

        <div class="mt-1 flex items-center space-x-4 text-sm text-gray-500">
          <div class="flex items-center space-x-1">
            <Clock size={14} />
            <span
              >Applied {formatApplicationDate(application._creationTime)}</span
            >
          </div>
          {#if application.applicant?.profile?.location}
            <span>📍 {application.applicant.profile.location}</span>
          {/if}
        </div>

        {#if application.applicant?.profile?.bio}
          <p class="mt-2 line-clamp-2 text-sm text-gray-600">
            {application.applicant.profile.bio}
          </p>
        {/if}

        {#if application.message}
          <div class="mt-3 rounded-lg bg-gray-50 p-3">
            <div class="mb-1 flex items-center space-x-2 text-sm text-gray-600">
              <MessageCircle size={14} />
              <span>Application message:</span>
            </div>
            <p class="text-sm text-gray-900">"{application.message}"</p>
          </div>
        {/if}

        {#if application.ownerResponse}
          <div class="mt-3 rounded-lg bg-blue-50 p-3">
            <div class="mb-1 flex items-center space-x-2 text-sm text-blue-600">
              <MessageCircle size={14} />
              <span>Your response:</span>
            </div>
            <p class="text-sm text-blue-900">"{application.ownerResponse}"</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Status and Actions -->
    <div class="flex flex-col items-end space-y-2">
      <span
        class="inline-flex rounded-full border px-2 py-1 text-xs font-medium {getStatusColor(
          application.status,
        )}"
      >
        {getStatusText(application.status)}
      </span>

      {#if application.status === "pending"}
        <div class="flex space-x-2">
          <Button
            variant="danger"
            size="sm"
            onclick={() => startAction("reject")}
            disabled={loading}
            class="!bg-red-50 !text-red-600 hover:!bg-red-100"
          >
            <X size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onclick={() => startAction("approve")}
            disabled={loading}
            class="!bg-green-50 !text-green-600 hover:!bg-green-100"
          >
            <Check size={16} />
          </Button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Response Form -->
  {#if showResponseForm}
    <div class="mt-6 border-t pt-4">
      <div class="space-y-4">
        <div>
          <label
            for="response-message"
            class="mb-2 block text-sm font-medium text-gray-700"
          >
            {actionType === "approve" ? "Approval" : "Rejection"} message (optional)
          </label>
          <textarea
            id="response-message"
            bind:value={responseMessage}
            placeholder={actionType === "approve"
              ? "Welcome! Looking forward to meeting you..."
              : "Thank you for your interest, but..."}
            class="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500"
            rows="3"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onclick={cancelResponse}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={actionType === "approve" ? "primary" : "danger"}
            size="sm"
            onclick={handleSubmitResponse}
            disabled={loading}
          >
            {actionType === "approve" ? "Approve" : "Reject"} Application
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
  }
</style>
