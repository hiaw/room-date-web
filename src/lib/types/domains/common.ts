// Common utilities and shared types
import type { Component } from "svelte";

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

export interface PaginationResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
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

// Re-export commonly used types from external libraries
export type { Component };
