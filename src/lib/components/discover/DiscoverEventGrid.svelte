<script lang="ts">
  import EventCard from "$lib/components/EventCard.svelte";
  import type { EventData } from "$lib/types/components";
  import { discoverFilters } from "$lib/stores/discover-filters.js";

  interface Props {
    events: EventData[];
  }

  let { events }: Props = $props();

  // Memoized filter functions for better performance
  let searchRegex = $derived(
    $discoverFilters.searchQuery
      ? new RegExp(
          $discoverFilters.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
          "i",
        )
      : null,
  );

  // Pre-compute date ranges for better performance
  let todayRange = $derived(() => {
    const now = Date.now();
    const today = new Date(now);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    return { start: todayStart, end: todayEnd };
  });

  let weekRange = $derived(() => {
    const now = Date.now();
    const today = new Date(now);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const weekStart = new Date(
      todayStart.getTime() - todayStart.getDay() * 24 * 60 * 60 * 1000,
    );
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start: weekStart, end: weekEnd };
  });

  let monthRange = $derived(() => {
    const now = Date.now();
    const today = new Date(now);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return { start: monthStart, end: monthEnd };
  });

  // Filter events based on search and filters
  let filteredEvents = $derived(() => {
    let filtered = events.filter((event: EventData) => {
      if (!event) return false;

      // Search filter - use regex for better performance
      if (searchRegex) {
        const searchableText = [
          event.title,
          event.description,
          event.roomTitle,
          event.roomDescription,
          event.category,
          ...(event.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchRegex.test(searchableText)) return false;
      }

      // Gender filter
      if (
        $discoverFilters.selectedGenders.length > 0 &&
        event.preferredGender
      ) {
        const hasMatchingGender = $discoverFilters.selectedGenders.some(
          (gender) => event.preferredGender?.includes(gender),
        );
        if (!hasMatchingGender) return false;
      }

      // Age filter (if event specifies age requirements)
      if (event.minAge && $discoverFilters.ageRange.max < event.minAge)
        return false;
      if (event.maxAge && $discoverFilters.ageRange.min > event.maxAge)
        return false;

      // Category filter
      if ($discoverFilters.selectedCategories.length > 0 && event.category) {
        if (!$discoverFilters.selectedCategories.includes(event.category))
          return false;
      }

      // Activity level filter
      if (
        $discoverFilters.selectedActivityLevel &&
        event.activityLevel !== $discoverFilters.selectedActivityLevel
      ) {
        return false;
      }

      // Date range filter - use pre-computed ranges
      if ($discoverFilters.selectedDateRange !== "any" && event.startTime) {
        const eventDate = new Date(event.startTime);

        switch ($discoverFilters.selectedDateRange) {
          case "today": {
            const todayRangeObj = todayRange();
            if (
              eventDate < todayRangeObj.start ||
              eventDate >= todayRangeObj.end
            )
              return false;
            break;
          }
          case "this_week": {
            const weekRangeObj = weekRange();
            if (eventDate < weekRangeObj.start || eventDate >= weekRangeObj.end)
              return false;
            break;
          }
          case "this_month": {
            const monthRangeObj = monthRange();
            if (
              eventDate < monthRangeObj.start ||
              eventDate >= monthRangeObj.end
            )
              return false;
            break;
          }
        }
      }

      // Past events filter
      if (!$discoverFilters.showPastEvents && event.startTime) {
        const eventDate = new Date(event.startTime);
        const now = new Date();
        if (eventDate < now) return false;
      }

      // Guest count filter
      if (event.maxGuests) {
        if (
          event.maxGuests < $discoverFilters.guestCountRange.min ||
          event.maxGuests > $discoverFilters.guestCountRange.max
        )
          return false;
      }

      return true;
    });

    // Sort filtered events
    return filtered.sort((a: EventData, b: EventData) => {
      let comparison = 0;

      switch ($discoverFilters.sortBy) {
        case "distance":
          comparison = (a.distance || 0) - (b.distance || 0);
          break;
        case "date":
          comparison = (a.startTime || 0) - (b.startTime || 0);
          break;
        case "popularity":
          comparison = (b.applicationCount || 0) - (a.applicationCount || 0);
          break;
        case "newest":
          comparison = (b._creationTime || 0) - (a._creationTime || 0);
          break;
      }

      return $discoverFilters.sortOrder === "asc" ? comparison : -comparison;
    });
  });
</script>

<div class="space-y-4">
  {#each filteredEvents() as event, index (event._id)}
    <div class="stagger-item" style="animation-delay: {index * 0.1}s">
      <EventCard {event} />
    </div>
  {/each}
</div>
