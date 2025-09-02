// Common UI component prop types and interfaces
import type { Doc } from "../../../convex/_generated/dataModel";
import type { Message } from "./messaging";

// Button component types
export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  class?: string;
  onclick?: () => void;
}

// Loading spinner types
export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

// Avatar component types
export interface AvatarProps {
  src?: string;
  alt?: string;
  displayName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallbackBg?: string;
}

// Message bubble types
export interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  compact?: boolean;
}

// Event message bubble types (for event chat)
export interface EventMessageBubbleProps {
  message: Doc<"eventMessages">;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  compact?: boolean;
}

// Input component types
export interface TextInputProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  type?: "text" | "email" | "password" | "tel" | "url";
  class?: string;
  onInput?: (value: string) => void;
  onChange?: (value: string) => void;
}

export interface TextAreaProps {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  class?: string;
  onInput?: (value: string) => void;
  onChange?: (value: string) => void;
  onKeydown?: (event: KeyboardEvent) => void;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
}

// Modal/Dialog types
export interface ModalProps {
  isOpen: boolean;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClose: () => void;
}

// Card component types
export interface CardProps {
  title?: string;
  subtitle?: string;
  class?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

// List component types
export interface ListItemProps {
  id: string;
  primary: string;
  secondary?: string;
  avatar?: AvatarProps;
  actions?: ButtonProps[];
  onClick?: () => void;
}

// Form field types
export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  class?: string;
}

// Notification/Toast types
export interface NotificationProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  onDismiss?: () => void;
}

// Search input types
export interface SearchInputProps {
  value: string;
  placeholder?: string;
  onInput: (value: string) => void;
  onClear?: () => void;
  class?: string;
}

// Badge/Tag types
export interface BadgeProps {
  text: string;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
}

// Dropdown types
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  class?: string;
}

// Generic list/collection types
export interface ListProps<T> {
  items: T[];
  loading?: boolean;
  empty?: {
    title: string;
    message: string;
    action?: ButtonProps;
  };
  renderItem: (item: T, index: number) => any;
}
