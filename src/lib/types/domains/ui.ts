// UI and component domain types
import type { Component } from "svelte";

// Basic UI Types
export type LoadingState = "idle" | "loading" | "success" | "error";
export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type Position = "top" | "bottom" | "left" | "right";
export type Alignment = "start" | "center" | "end";

// Navigation Types
export interface Route {
  path: string;
  title: string;
  icon?: unknown;
  badge?: string | number;
  children?: Route[];
}

export interface NavigationItem {
  id: string;
  path: string;
  icon: Component;
  label: string;
  authRequired: boolean;
}

export interface NavigationState {
  currentTab: "explore" | "rooms" | "connections" | "profile";
  previousTab?: string;
  canGoBack: boolean;
}

// Mobile/UI specific types
export interface MobileViewport {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
}

// Theme Types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    light: string;
    dark: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
}

// Animation Types
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fill?: "none" | "forwards" | "backwards" | "both";
  iterations?: number | "infinite";
}

export interface TransitionConfig extends AnimationConfig {
  type: "fade" | "slide" | "scale" | "blur" | "fly";
  x?: number;
  y?: number;
  opacity?: number;
  scale?: number;
  blur?: number;
}

// Media Types
export interface ImageData {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  loading?: "lazy" | "eager";
}

export interface VideoData {
  src: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
}

// Component Props Types
export interface EventCardProps {
  event: import("./events").EventData;
}

export interface AppLayoutProps {
  currentRoute: string | null | undefined;
  children: import("svelte").Snippet;
}

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

export interface ErrorMessageProps {
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export interface VirtualizedListProps<T = unknown> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: import("svelte").Snippet<[item: T, index: number]>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface OfflineIndicatorProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventCardSkeletonProps {}

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

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: import("svelte").Snippet;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onSearch?: (query: string) => void;
  onInput?: (query: string) => void;
  debounceMs?: number;
  disabled?: boolean;
  showClearButton?: boolean;
}

export interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: import("svelte").Snippet;
  title?: string;
}

export interface BadgeProps {
  text: string;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  removable?: boolean;
}

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square" | "rounded";
  onClick?: () => void;
}

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

export interface EmptyStateProps {
  icon?: Component;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
