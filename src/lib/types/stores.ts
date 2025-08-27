// Store Types
// Types for Svelte stores and their state structures

// Auth Store Types
export interface User {
  _id: string;
  email?: string;
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthStore {
  subscribe: (callback: (state: AuthState) => void) => () => void;
  checkExistingAuth: () => boolean;
  setUser: (userData: User | null) => void;
  setAuthSuccess: (userData: User | null, tokens: unknown) => void;
  setAuthError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

// Network Store Types
export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export interface NetworkStore {
  subscribe: (callback: (state: NetworkStatus) => void) => () => void;
  set: (state: NetworkStatus) => void;
  update: (updater: (state: NetworkStatus) => NetworkStatus) => void;
}

// Generic Store Types
export interface Store<T> {
  subscribe: (callback: (value: T) => void) => () => void;
  set: (value: T) => void;
  update: (updater: (value: T) => T) => void;
}

export interface WritableStore<T> extends Store<T> {
  set: (value: T) => void;
  update: (updater: (value: T) => T) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ReadableStore<T> extends Store<T> {
  // Readable stores only have subscribe
}

// Form Store Types (for complex form state management)
export interface FormStoreState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormStore<T = unknown>
  extends WritableStore<FormStoreState<T>> {
  setField: (field: keyof T, value: unknown) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  reset: () => void;
  validate: () => boolean;
  submit: () => Promise<void>;
}

// Pagination Store Types
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  hasMore: boolean;
  loading: boolean;
}

export interface PaginationStore extends WritableStore<PaginationState> {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

// Infinite Scroll Store Types
export interface InfiniteScrollState<T = unknown> {
  items: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor?: string;
  pageSize: number;
}

export interface InfiniteScrollStore<T = unknown>
  extends WritableStore<InfiniteScrollState<T>> {
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

// Search Store Types
export interface SearchState {
  query: string;
  results: unknown[];
  isSearching: boolean;
  error: string | null;
  filters: Record<string, unknown>;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface SearchStore extends WritableStore<SearchState> {
  setQuery: (query: string) => void;
  setFilters: (filters: Record<string, unknown>) => void;
  setSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
  search: () => Promise<void>;
  clearResults: () => void;
}

// Notification Store Types
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationState {
  notifications: Notification[];
}

export interface NotificationStore extends WritableStore<NotificationState> {
  add: (notification: Omit<Notification, "id">) => string;
  remove: (id: string) => void;
  clear: () => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

// Modal Store Types
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: unknown;
  size?: "sm" | "md" | "lg" | "xl";
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCloseButton?: boolean;
}

export interface ModalStore extends WritableStore<ModalState> {
  open: (config: Partial<ModalState>) => void;
  close: () => void;
  confirm: () => void;
}

// Theme Store Types
export interface ThemeState {
  mode: "light" | "dark" | "system";
  isDark: boolean;
}

export interface ThemeStore extends WritableStore<ThemeState> {
  setMode: (mode: "light" | "dark" | "system") => void;
  toggle: () => void;
}

// Loading Store Types
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number; // 0-100
}

export interface LoadingStore extends WritableStore<LoadingState> {
  start: (message?: string) => void;
  stop: () => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
}

// Local Storage Store Types
export interface LocalStorageState<T = unknown> {
  data: T;
  isLoaded: boolean;
  error: string | null;
}

export interface LocalStorageStore<T = unknown>
  extends WritableStore<LocalStorageState<T>> {
  setData: (data: T) => void;
  clear: () => void;
  reload: () => void;
}

// Session Storage Store Types
export interface SessionStorageState<T = unknown> {
  data: T;
  isLoaded: boolean;
  error: string | null;
}

export interface SessionStorageStore<T = unknown>
  extends WritableStore<SessionStorageState<T>> {
  setData: (data: T) => void;
  clear: () => void;
  reload: () => void;
}
