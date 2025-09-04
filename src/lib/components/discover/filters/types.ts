import type { DateRange, SortBy } from "$lib/types/discover.js";

export interface EventCategory {
  value: string;
  label: string;
  emoji: string;
}

export interface ActivityLevelOption {
  value: string;
  label: string;
  description: string;
}

// Event categories
export const eventCategories: EventCategory[] = [
  { value: "social", label: "Social", emoji: "🎉" },
  { value: "dining", label: "Dining", emoji: "🍽️" },
  { value: "games", label: "Games", emoji: "🎮" },
  { value: "arts", label: "Arts & Culture", emoji: "🎨" },
  { value: "fitness", label: "Fitness", emoji: "💪" },
  { value: "professional", label: "Networking", emoji: "💼" },
  { value: "outdoor", label: "Outdoor", emoji: "🌿" },
  { value: "music", label: "Music", emoji: "🎵" },
];

export const activityLevels: ActivityLevelOption[] = [
  {
    value: "low",
    label: "Chill",
    description: "Relaxed, low-key activities",
  },
  { value: "medium", label: "Active", description: "Moderate engagement" },
  {
    value: "high",
    label: "High Energy",
    description: "Active, energetic events",
  },
];

export const dateRangeOptions = [
  { value: "any" as DateRange, label: "Anytime" },
  { value: "today" as DateRange, label: "Today" },
  { value: "this_week" as DateRange, label: "This Week" },
  { value: "this_month" as DateRange, label: "This Month" },
];

export const sortOptions = [
  { value: "distance" as SortBy, label: "Distance" },
  { value: "date" as SortBy, label: "Date" },
  { value: "popularity" as SortBy, label: "Popularity" },
  { value: "newest" as SortBy, label: "Newest First" },
];
