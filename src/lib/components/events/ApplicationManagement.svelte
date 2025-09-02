<script lang="ts">
  import { useQuery, useConvexClient } from "convex-svelte";
  import { loadApi, type ConvexAPI } from "../../convex/api.js";
  import ApplicantCard from "./ApplicantCard.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import { Users, Clock, CheckCircle, XCircle } from "lucide-svelte";
  import type { ApplicationManagementProps } from "$lib/types/components.js";
  import type { Id } from "../../../convex/_generated/dataModel";
  import { browser } from "$app/environment";

  let { eventId }: ApplicationManagementProps = $props();

  // Import API only on client side
  let api: ConvexAPI | null = null;

  if (browser) {
    loadApi()
      .then((loadedApi) => {
        api = loadedApi;
      })
      .catch((error) => {
        console.error(
          "Failed to load Convex API in ApplicationManagement:",
          error,
        );
      });
  }

  // Fetch applications for this event
  let applicationsQuery = $derived(
    api
      ? useQuery((api as ConvexAPI).eventApplications.getEventApplications, {
          eventId,
        })
      : null,
  );
  let applications = $derived(applicationsQuery?.data ?? []);
  let applicationsLoading = $derived(applicationsQuery?.isLoading ?? true);

  // Convex client for mutations
  let convex = useConvexClient();

  // Track processing applications
  let processingApplications = $state(new Set<string>());

  // Derived states with proper typing
  let pendingApplications = $derived(
    applications.filter((app: { status: string }) => app.status === "pending"),
  );
  let approvedApplications = $derived(
    applications.filter((app: { status: string }) => app.status === "approved"),
  );
  let rejectedApplications = $derived(
    applications.filter((app: { status: string }) => app.status === "rejected"),
  );

  // Handle application approval
  async function handleApprove(applicationId: string, message?: string) {
    if (!api) {
      console.error("API not available");
      return;
    }

    processingApplications.add(applicationId);

    try {
      await convex.mutation(api.eventApplications.respondToApplication, {
        applicationId: applicationId as Id<"eventApplications">,
        status: "approved",
        ownerResponse: message,
      });
    } catch (error) {
      console.error("Failed to approve application:", error);
      throw error;
    } finally {
      processingApplications.delete(applicationId);
    }
  }

  async function handleReject(
    applicationId: string,
    message?: string,
  ): Promise<void> {
    if (!api) {
      console.error("API not available");
      return;
    }

    processingApplications.add(applicationId);

    try {
      await convex.mutation(api.eventApplications.respondToApplication, {
        applicationId: applicationId as Id<"eventApplications">,
        status: "rejected",
        ownerResponse: message,
      });
    } catch (error) {
      console.error("Failed to reject application:", error);
      throw error;
    } finally {
      processingApplications.delete(applicationId);
    }
  }

  function getStatsText() {
    const total = applications.length;
    const pending = pendingApplications.length;
    const approved = approvedApplications.length;

    if (total === 0) return "No applications yet";
    if (pending === 0)
      return `${total} application${total === 1 ? "" : "s"} reviewed`;
    return `${pending} pending • ${approved} approved • ${total} total`;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-xl font-semibold text-gray-900">Applications</h2>
      <p class="text-sm text-gray-600">
        {getStatsText()}
      </p>
    </div>
  </div>

  {#if applicationsLoading}
    <div class="flex items-center justify-center py-12">
      <LoadingSpinner />
    </div>
  {:else if applications.length === 0}
    <!-- Empty State -->
    <div
      class="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center"
    >
      <Users class="mx-auto h-16 w-16 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">
        No Applications Yet
      </h3>
      <p class="mt-2 text-gray-500">
        People who apply to your event will appear here for you to review.
      </p>
    </div>
  {:else}
    <div class="space-y-8">
      <!-- Pending Applications -->
      {#if pendingApplications.length > 0}
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Clock class="h-5 w-5 text-yellow-600" />
            <h3 class="font-medium text-gray-900">
              Pending Review ({pendingApplications.length})
            </h3>
          </div>
          <div class="space-y-4">
            {#each pendingApplications as application (application._id)}
              <ApplicantCard
                {application}
                onApprove={handleApprove}
                onReject={handleReject}
                loading={processingApplications.has(application._id)}
              />
            {/each}
          </div>
        </div>
      {/if}

      <!-- Approved Applications -->
      {#if approvedApplications.length > 0}
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <CheckCircle class="h-5 w-5 text-green-600" />
            <h3 class="font-medium text-gray-900">
              Approved ({approvedApplications.length})
            </h3>
          </div>
          <div class="space-y-4">
            {#each approvedApplications as application (application._id)}
              <ApplicantCard
                {application}
                onApprove={handleApprove}
                onReject={handleReject}
                loading={processingApplications.has(application._id)}
              />
            {/each}
          </div>
        </div>
      {/if}

      <!-- Rejected Applications -->
      {#if rejectedApplications.length > 0}
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <XCircle class="h-5 w-5 text-red-600" />
            <h3 class="font-medium text-gray-900">
              Rejected ({rejectedApplications.length})
            </h3>
          </div>
          <div class="space-y-4">
            {#each rejectedApplications as application (application._id)}
              <ApplicantCard
                {application}
                onApprove={handleApprove}
                onReject={handleReject}
                loading={processingApplications.has(application._id)}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
