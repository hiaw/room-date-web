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
