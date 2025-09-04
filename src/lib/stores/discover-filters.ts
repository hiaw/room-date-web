import { writable } from "svelte/store";
import type { FilterState } from "$lib/types/discover.js";

const initialState: FilterState = {
  searchQuery: "",
  showFilters: false,
  selectedGenders: [],
  ageRange: { min: 18, max: 65 },
  maxDistance: 25,
  selectedCategories: [],
  selectedActivityLevel: null,
  selectedDateRange: "any",
  showPastEvents: false,
  guestCountRange: { min: 1, max: 50 },
  sortBy: "distance",
  sortOrder: "asc",
};

export const discoverFilters = writable<FilterState>(initialState);

export function resetFilters() {
  discoverFilters.set(initialState);
}

export function updateFilter<K extends keyof FilterState>(
  key: K,
  value: FilterState[K],
) {
  discoverFilters.update((state) => ({
    ...state,
    [key]: value,
  }));
}
