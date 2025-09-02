<script lang="ts">
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { Monitor, Smartphone, Tablet, X } from "lucide-svelte";
  import Button from "../ui/Button.svelte";
  import { generateDeviceFingerprint } from "$lib/utils/security.js";
  import type { Id } from "../../../convex/_generated/dataModel.js";

  let convex = useConvexClient();

  // Fetch user's active sessions
  let sessionsQuery = useQuery(api.sessions.getUserSessions, {});
  let sessions = $derived(sessionsQuery?.data ?? []);
  let loading = $derived(sessionsQuery?.isLoading ?? true);

  // Current device fingerprint
  let currentDeviceFingerprint = $state("");

  $effect(() => {
    const fingerprint = generateDeviceFingerprint();
    if (fingerprint) {
      currentDeviceFingerprint = fingerprint.hash;
    }
  });

  // Get device icon based on user agent
  function getDeviceIcon(userAgent: string) {
    if (/Mobile|Android|iPhone/i.test(userAgent)) {
      return Smartphone;
    }
    if (/iPad|Tablet/i.test(userAgent)) {
      return Tablet;
    }
    return Monitor;
  }

  // Get device name based on user agent
  function getDeviceName(userAgent: string): string {
    if (/iPhone/i.test(userAgent)) return "iPhone";
    if (/iPad/i.test(userAgent)) return "iPad";
    if (/Android/i.test(userAgent)) return "Android Device";
    if (/Windows/i.test(userAgent)) return "Windows Computer";
    if (/Mac/i.test(userAgent)) return "Mac";
    if (/Linux/i.test(userAgent)) return "Linux Computer";
    return "Unknown Device";
  }

  // Get location description (simplified)
  function getLocationDescription(): string {
    // In a real app, you'd use IP geolocation
    return "Unknown Location";
  }

  // Format last activity time
  function formatLastActivity(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Active now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  // Revoke a specific session
  async function revokeSession(sessionId: string) {
    try {
      await convex.mutation(api.sessions.revokeSession, {
        sessionId: sessionId as Id<"authSessions">,
      });
    } catch (error) {
      console.error("Failed to revoke session:", error);
    }
  }

  // Revoke all other sessions
  async function revokeAllOtherSessions() {
    try {
      await convex.mutation(api.sessions.revokeAllOtherSessions, {});
    } catch (error) {
      console.error("Failed to revoke other sessions:", error);
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h2 class="text-xl font-semibold text-gray-900">Active Sessions</h2>
    <p class="mt-1 text-sm text-gray-600">
      Manage your active login sessions across all devices
    </p>
  </div>

  {#if loading}
    <div class="animate-pulse space-y-4">
      {#each [0, 1, 2] as i (i)}
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div class="h-4 w-1/3 rounded bg-gray-300"></div>
          <div class="mt-2 h-3 w-1/2 rounded bg-gray-300"></div>
        </div>
      {/each}
    </div>
  {:else if sessions.length === 0}
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <Monitor class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">No Active Sessions</h3>
      <p class="mt-2 text-gray-600">You don't have any active sessions.</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each sessions as session (session._id)}
        {@const DeviceIcon = getDeviceIcon(session.userAgent || "")}
        {@const isCurrentSession =
          session.deviceFingerprint === currentDeviceFingerprint}

        <div
          class="rounded-lg border border-gray-200 bg-white p-4 {isCurrentSession
            ? 'ring-2 ring-purple-500'
            : ''}"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-3">
              <div class="rounded-lg bg-gray-100 p-2">
                <DeviceIcon class="h-5 w-5 text-gray-600" />
              </div>

              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <h3 class="font-medium text-gray-900">
                    {getDeviceName(session.userAgent || "")}
                  </h3>
                  {#if isCurrentSession}
                    <span
                      class="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                    >
                      Current Session
                    </span>
                  {/if}
                </div>

                <div class="mt-1 space-y-1 text-sm text-gray-600">
                  <p>
                    Last activity: {formatLastActivity(session._creationTime)}
                  </p>
                  <p>Location: {getLocationDescription()}</p>
                  {#if session.userAgent}
                    <p class="truncate" title={session.userAgent}>
                      {session.userAgent}
                    </p>
                  {/if}
                </div>
              </div>
            </div>

            {#if !isCurrentSession}
              <Button
                variant="danger"
                size="sm"
                onclick={() => revokeSession(session._id)}
                class="text-red-600 hover:text-red-700"
              >
                <X class="h-4 w-4" />
                Revoke
              </Button>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Actions -->
    {#if sessions.length > 1}
      <div class="flex justify-center pt-4">
        <Button
          variant="danger"
          onclick={revokeAllOtherSessions}
          class="text-red-600 hover:text-red-700"
        >
          Sign Out All Other Devices
        </Button>
      </div>
    {/if}
  {/if}

  <!-- Security Information -->
  <div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
    <h4 class="font-medium text-blue-900">Security Information</h4>
    <div class="mt-2 space-y-1 text-sm text-blue-700">
      <p>• Sessions automatically expire after periods of inactivity</p>
      <p>• Sensitive actions may require recent authentication</p>
      <p>• You'll receive notifications for logins from new devices</p>
      <p>• Revoked sessions will be signed out immediately</p>
    </div>
  </div>
</div>
