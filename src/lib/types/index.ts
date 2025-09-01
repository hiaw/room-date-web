// Type Exports
// Central export file for all type definitions organized by domain

// Domain-specific exports with explicit naming to avoid conflicts
export type {
  User,
  UserId,
  UserProfile,
  UserProfileId,
  UserWithProfile,
  UserSettings,
  UserSettingsId,
  AuthFormData,
  UpdateProfileData,
  UpdateSettingsData,
  OAuthProfile,
  ExistingUser,
  UserDataUpdates,
  AuthTokens,
  SecurityEvent,
  SecuritySeverity,
  AuthFormProps,
  PushNotificationToken,
  Platform,
  UserInsights,
} from "./domains/user-types";

export * from "./domains/rooms";
export * from "./domains/events";
export * from "./domains/messaging";
export * from "./domains/common";

// UI types (with resolved conflicts)
export type {
  Size,
  Variant,
  Position,
  Alignment,
  Route,
  NavigationItem,
  NavigationState,
  MobileViewport,
  Theme,
  AnimationConfig,
  TransitionConfig,
  ImageData,
  VideoData,
  EventCardProps,
  AppLayoutProps,
  ImageUploaderProps,
  ButtonProps,
  ErrorMessageProps,
  LoadingSpinnerProps,
  VirtualizedListProps,
  OfflineIndicatorProps,
  EventCardSkeletonProps,
  FormFieldProps,
  SelectOption,
  SelectProps,
  ModalProps,
  ToastProps,
  PaginationProps,
  SearchInputProps,
  FilterPanelProps,
  BadgeProps,
  AvatarProps,
  CardProps,
  EmptyStateProps,
} from "./domains/ui";

// Export LoadingState with explicit name to resolve conflict
export type { LoadingState as UILoadingState } from "./domains/ui";

// Legacy exports (for backward compatibility) - avoid User conflict
export type {
  User as LegacyStoreUser, // From stores.ts
} from "./stores";
export * from "./pages";

// Form types (keeping original structure for now)
export type {
  ProfileFormData,
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
