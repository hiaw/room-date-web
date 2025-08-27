// Component Types
// Types for reusable UI components and their props

import type { Component } from "svelte";

// Event Card Component Types
export interface EventData {
  _id: string;
  title?: string;
  description?: string;
  suggestedTimes?: Date[];
  isFlexibleTiming?: boolean;
  maxGuests?: number;
  preferredGender?: string[];
  minAge?: number;
  maxAge?: number;
  roomTitle?: string;
  roomDescription?: string;
  roomCity?: string;
  roomState?: string;
  hostName?: string;
  hostAge?: number;
  distanceMiles?: number;
  applicantCount?: number;
  _creationTime: number;
  // Additional fields from Convex queries
  applicationCount?: number;
  pendingApplicationCount?: number;
  distance?: number;
  roomLatitude?: number;
  roomLongitude?: number;
  startTime?: number;
  endTime?: number;
  category?: string;
  activityLevel?: "low" | "medium" | "high";
  tags?: string[];
  primaryEventImageUrl?: string;
  eventImages?: string[];
  hostImageUrl?: string;
}

export interface EventCardProps {
  event: EventData;
}

// Auth Form Component Types
export interface AuthFormProps {
  onSubmit: (email: string, password: string, name?: string) => Promise<void>;
  isSignUp?: boolean;
  loading?: boolean;
  error?: string | null;
}

// App Layout Component Types
export interface AppLayoutProps {
  currentRoute: string | null | undefined;
  children?: any;
}

// Navigation Item Type
export interface NavigationItem {
  id: string;
  path: string;
  icon: Component;
  label: string;
  authRequired: boolean;
}

// Image Uploader Component Types
export interface ImageUploaderProps {
  images?: string[];
  maxImages?: number;
  onImagesChange: (images: string[]) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  label?: string;
  accept?: string;
  disabled?: boolean;
}

// Button Component Types
export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  class?: string;
  onclick?: () => void;
  children: import("svelte").Snippet;
}

// Error Message Component Types
export interface ErrorMessageProps {
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

// Loading Spinner Component Types
export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

// Virtualized List Component Types
export interface VirtualizedListProps<T = any> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => any;
}

// Offline Indicator Component Types
export interface OfflineIndicatorProps {
  // No props needed, component handles its own state
}

// Event Card Skeleton Component Types
export interface EventCardSkeletonProps {
  // No props needed, just a loading skeleton
}

// Form Field Component Types (if we create reusable form components)
export interface FormFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  value?: string | number;
  onInput?: (value: string | number) => void;
}

// Select/Dropdown Component Types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (value: string | number) => void;
}

// Modal/Dialog Component Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: import("svelte").Snippet;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

// Toast/Notification Component Types
export interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

// Pagination Component Types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

// Search Input Component Types
export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch?: (query: string) => void;
  onInput?: (query: string) => void;
  debounceMs?: number;
  disabled?: boolean;
  showClearButton?: boolean;
}

// Filter Panel Component Types
export interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: import("svelte").Snippet;
  title?: string;
}

// Badge/Chip Component Types
export interface BadgeProps {
  text: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
}

// Avatar Component Types
export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square" | "rounded";
  onClick?: () => void;
}

// Card Component Types
export interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  actions?: import("svelte").Snippet;
  children: import("svelte").Snippet;
  variant?: "default" | "elevated" | "outlined";
  onClick?: () => void;
  hoverable?: boolean;
}

// Empty State Component Types
export interface EmptyStateProps {
  icon?: Component;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
