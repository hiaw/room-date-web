// Type Exports
// Central export file for all type definitions

// Schema types (Convex database types)
export * from "./schema";

// Component types
export * from "./components";

// Page types
export * from "./pages";

// Store types
export * from "./stores";

// Form types
export type {
  AuthFormData,
  ProfileFormData,
  RoomFormData,
  EventFormData,
  MessageFormData,
  ApplicationFormData,
  FormField,
  FormState,
  ValidationRule,
  ValidationRules,
  ValidationResult,
  FormSubmissionResult,
  FormSubmissionHandler,
  FormFieldConfig,
  FormConfig,
  UseFormOptions,
  UseFormReturn,
  FileUploadState,
  FileUploadOptions,
  FormContextValue,
} from "./forms";

// Re-export ValidationError from forms (resolving conflict)
export type { ValidationError as FormValidationError } from "./forms";

// Re-export commonly used types from external libraries
export type { Component } from "svelte";

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type NonNullable<T> = T extends null | undefined ? never : T;
export type ValueOf<T> = T[keyof T];
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Common utility types
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

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Event types
export interface CustomEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  source?: string;
}

// Navigation types
export interface Route {
  path: string;
  title: string;
  icon?: unknown;
  badge?: string | number;
  children?: Route[];
}

// Theme types
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

// Animation types
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

// Media types
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

// Geolocation types
export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface GeolocationPosition {
  coords: Coordinates;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
  PERMISSION_DENIED: 1;
  POSITION_UNAVAILABLE: 2;
  TIMEOUT: 3;
}

// Web API types
export interface IntersectionObserverEntry {
  target: Element;
  isIntersecting: boolean;
  intersectionRatio: number;
  intersectionRect: DOMRectReadOnly;
  boundingClientRect: DOMRectReadOnly;
  rootBounds: DOMRectReadOnly | null;
  time: number;
}

export interface ResizeObserverEntry {
  target: Element;
  contentRect: DOMRectReadOnly;
  borderBoxSize?: readonly ResizeObserverSize[];
  contentBoxSize?: readonly ResizeObserverSize[];
  devicePixelContentBoxSize?: readonly ResizeObserverSize[];
}

export interface ResizeObserverSize {
  inlineSize: number;
  blockSize: number;
}
