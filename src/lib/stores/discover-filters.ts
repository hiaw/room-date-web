import { writable } from "svelte/store";

export interface AgeRange {
  min: number;
  max: number;
}

export interface GuestCountRange {
  min: number;
  max: number;
}

export type DateRange = "any" | "today" | "this_week" | "this_month";
export type ActivityLevel = "low" | "medium" | "high" | null;
export type SortBy = "distance" | "date" | "popularity" | "newest";
export type SortOrder = "asc" | "desc";

export interface FilterState {
  searchQuery: string;
  showFilters: boolean;
  selectedGenders: string[];
  ageRange: AgeRange;
  maxDistance: number;
  selectedCategories: string[];
  selectedActivityLevel: ActivityLevel;
  selectedDateRange: DateRange;
  showPastEvents: boolean;
  guestCountRange: GuestCountRange;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

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
