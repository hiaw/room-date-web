<script lang="ts">
  import { onMount } from "svelte";
  import { useQuery, useConvexClient } from "convex-svelte";
  import { api } from "../../../convex/_generated/api.js";
  import { isAuthenticated } from "$lib/stores/auth.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Clock,
    Heart,
    Send,
    MessageCircle,
  } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import ApplicationManagement from "$lib/components/events/ApplicationManagement.svelte";
  import type { Id } from "../../../convex/_generated/dataModel";

  const eventId = $page.params.eventId as Id<"events">;

  // Redirect if not authenticated
  onMount(() => {
    if (!$isAuthenticated) {
      goto("/");
    }
  });

  // Fetch event details
  let eventQuery = useQuery(api.events.getEvent, { eventId });
  let event = $derived(eventQuery?.data);
  let eventLoading = $derived(eventQuery?.isLoading ?? true);

  // Get current user to check ownership
  let userProfileQuery = useQuery(api.userProfiles.getUserProfile, {});
  let currentUser = $derived(userProfileQuery?.data?.user);

  // Check chat access
  let chatAccessQuery = useQuery(api.eventChat.canAccessEventChat, { eventId });
  let canAccessChat = $derived(chatAccessQuery?.data?.canAccess ?? false);

  // Create convex client for mutations
  let convex = useConvexClient();
  let applying = $state(false);
  let bookmarking = $state(false);

  // Check if current user is the event owner
  let isEventOwner = $derived(() => {
    return event && currentUser && event.ownerId === currentUser._id;
  });

  function handleBack() {
    goto("/discover");
  }

  async function handleApply() {
    if (!event) return;

    applying = true;
    try {
      await convex.mutation(api.eventApplications.applyToEvent, {
        eventId: event._id,
        message: "", // Could add a form for this later
      });
      // Convex will automatically update the query due to reactivity
    } catch (error) {
      console.error("Failed to apply:", error);
      alert("Failed to apply to event. Please try again.");
    } finally {
      applying = false;
    }
  }

  async function handleBookmark() {
    if (!event) return;

    bookmarking = true;
    try {
      if (event.isBookmarked) {
        await convex.mutation(api.bookmarks.unbookmarkEvent, {
          eventId: event._id,
        });
      } else {
        await convex.mutation(api.bookmarks.bookmarkEvent, {
          eventId: event._id,
        });
      }
      // Convex will automatically update the query due to reactivity
    } catch (error) {
      console.error("Failed to bookmark:", error);
      alert("Failed to bookmark event. Please try again.");
    } finally {
      bookmarking = false;
    }
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(timestamp: number) {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatGenderPreferences(preferences: string[] | undefined) {
    if (!preferences || preferences.length === 0) return "Any";
    return preferences
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(", ");
  }
</script>

<svelte:head>
  <title>{event?.title || "Event"} - Room Dates</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <!-- Header -->
  <div
    class="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md"
  >
    <div class="px-4 py-4">
      <div class="flex items-center justify-between">
        <button
          onclick={handleBack}
          class="rounded-xl bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 class="text-xl font-bold text-gray-900">Event Details</h1>
        <div class="flex items-center space-x-2">
          {#if event && !isEventOwner()}
            <button
              onclick={handleBookmark}
              disabled={bookmarking}
              class="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 {event.isBookmarked
                ? 'text-red-500'
                : ''}"
            >
              <Heart
                size={20}
                fill={event.isBookmarked ? "currentColor" : "none"}
              />
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Application Management (Event Owners Only) -->
    {#if isEventOwner() && event}
      <div class="mb-6">
        <ApplicationManagement eventId={event._id} />
      </div>
    {/if}
  </div>

  {#if eventLoading}
    <div class="flex items-center justify-center py-16">
      <LoadingSpinner />
    </div>
  {:else if !event}
    <div class="flex flex-col items-center justify-center py-16">
      <h2 class="mb-2 text-2xl font-bold text-gray-900">Event Not Found</h2>
      <p class="mb-4 text-gray-600">
        The event you're looking for doesn't exist or has been removed.
      </p>
      <Button onclick={() => goto("/discover")}>Browse Events</Button>
    </div>
  {:else}
    <div class="mx-auto max-w-2xl px-4 py-6">
      <!-- Event Images -->
      {#if event.primaryEventImageUrl}
        <div class="mb-6 overflow-hidden rounded-2xl">
          <img
            src={event.primaryEventImageUrl}
            alt={event.title}
            class="h-64 w-full object-cover"
          />
        </div>
      {/if}

      <!-- Event Title and Description -->
      <div class="mb-6">
        <h1 class="mb-2 text-3xl font-bold text-gray-900">{event.title}</h1>
        {#if event.description}
          <p class="leading-relaxed text-gray-700">{event.description}</p>
        {/if}
      </div>

      <!-- Event Details -->
      <div class="mb-6 space-y-4">
        <!-- Date and Time -->
        {#if event.startTime}
          <div class="flex items-start space-x-3">
            <Calendar class="mt-1 text-purple-600" size={20} />
            <div>
              <p class="font-medium text-gray-900">
                {formatDate(event.startTime)}
              </p>
              <p class="text-gray-600">
                {formatTime(event.startTime)}
                {#if event.endTime}
                  - {formatTime(event.endTime)}
                {/if}
              </p>
            </div>
          </div>
        {:else if event.isFlexibleTiming}
          <div class="flex items-start space-x-3">
            <Clock class="mt-1 text-purple-600" size={20} />
            <div>
              <p class="font-medium text-gray-900">Flexible Timing</p>
              <p class="text-gray-600">Time to be arranged</p>
            </div>
          </div>
        {/if}

        <!-- Location -->
        <div class="flex items-start space-x-3">
          <MapPin class="mt-1 text-purple-600" size={20} />
          <div>
            <p class="font-medium text-gray-900">{event.roomTitle}</p>
            {#if event.roomCity}
              <p class="text-gray-600">{event.roomCity}</p>
            {/if}
          </div>
        </div>

        <!-- Guest Info -->
        <div class="flex items-start space-x-3">
          <Users class="mt-1 text-purple-600" size={20} />
          <div>
            <p class="font-medium text-gray-900">
              {#if event.maxGuests}
                Up to {event.maxGuests} guests
              {:else}
                No guest limit
              {/if}
            </p>
            {#if event.applicationCount > 0}
              <p class="text-gray-600">
                {event.applicationCount} people applied
              </p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div class="mb-6 rounded-xl bg-gray-50 p-4">
        <h3 class="mb-3 font-medium text-gray-900">Preferences</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          {#if event.minAge || event.maxAge}
            <div>
              <span class="text-gray-600">Age Range:</span>
              <span class="ml-1 font-medium">
                {event.minAge || 18} - {event.maxAge || 100}
              </span>
            </div>
          {/if}
          {#if event.guestGenderPreferences && event.guestGenderPreferences.length > 0}
            <div>
              <span class="text-gray-600">Gender Preferences:</span>
              <span class="ml-1 font-medium">
                {formatGenderPreferences(event.guestGenderPreferences)}
              </span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Host Info -->
      <div class="mb-6 rounded-xl border border-gray-200 p-4">
        <h3 class="mb-3 font-medium text-gray-900">Hosted by</h3>
        <div class="flex items-center space-x-3">
          {#if event.owner?.profile?.profileImageUrl}
            <img
              src={event.owner.profile.profileImageUrl}
              alt={event.owner.profile.displayName}
              class="h-12 w-12 rounded-full object-cover"
            />
          {:else}
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100"
            >
              <span class="font-medium text-purple-600">
                {event.owner?.profile?.displayName?.charAt(0) || "?"}
              </span>
            </div>
          {/if}
          <div>
            <p class="font-medium text-gray-900">
              {event.owner?.profile?.displayName || "Host"}
            </p>
            {#if event.owner?.profile?.bio}
              <p class="line-clamp-2 text-sm text-gray-600">
                {event.owner.profile.bio}
              </p>
            {/if}
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      {#if !isEventOwner()}
        <div class="sticky bottom-4 space-y-3">
          {#if !event.userApplication}
            <Button onclick={handleApply} disabled={applying} class="w-full">
              {#if applying}
                <div
                  class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                ></div>
              {:else}
                <Send size={16} class="mr-2" />
              {/if}
              Apply to Join
            </Button>
          {:else if event.userApplication.status === "pending"}
            <div
              class="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center"
            >
              <p class="font-medium text-yellow-800">Application Pending</p>
              <p class="text-sm text-yellow-700">Waiting for host response</p>
            </div>
          {:else if event.userApplication.status === "approved"}
            <div class="space-y-3">
              {#if canAccessChat}
                <Button
                  onclick={() => goto(`/events/${eventId}/chat`)}
                  variant="secondary"
                  class="w-full"
                >
                  <MessageCircle size={16} class="mr-2" />
                  Join Chat
                </Button>
              {/if}
              <div
                class="rounded-xl border border-green-200 bg-green-50 p-4 text-center"
              >
                <p class="font-medium text-green-800">Application Approved</p>
                <p class="text-sm text-green-700">
                  You're going to this event!
                </p>
              </div>
            </div>
          {:else if event.userApplication.status === "rejected"}
            <div
              class="rounded-xl border border-red-200 bg-red-50 p-4 text-center"
            >
              <p class="font-medium text-red-800">Application Not Accepted</p>
              <p class="text-sm text-red-700">
                Unfortunately, your application wasn't approved
              </p>
            </div>
          {/if}
        </div>
      {:else}
        <div class="sticky bottom-4 space-y-3">
          <Button
            onclick={() => goto(`/events/${eventId}/manage`)}
            class="w-full"
          >
            Manage Event
          </Button>
          {#if canAccessChat}
            <Button
              onclick={() => goto(`/events/${eventId}/chat`)}
              variant="secondary"
              class="w-full"
            >
              <MessageCircle size={16} class="mr-2" />
              Event Chat
            </Button>
          {/if}
          <div
            class="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center"
          >
            <p class="font-medium text-blue-800">This is Your Event</p>
            {#if event.applicationCount > 0}
              <p class="text-sm text-blue-700">
                {event.applicationCount} people have applied
              </p>
            {:else}
              <p class="text-sm text-blue-700">No applications yet</p>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
