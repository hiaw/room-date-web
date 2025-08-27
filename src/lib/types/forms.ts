// Form Types
// Types for form handling, validation, and data structures

// Generic Form Types
export interface FormField {
  value: unknown;
  error: string | null;
  touched: boolean;
  valid: boolean;
  required?: boolean;
}

export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  values: Record<string, unknown>;
}

export interface FormConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmit?: boolean;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
  message?: string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule | ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form Field Types
export interface TextFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "tel" | "url";
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  autocomplete?: string;
}

export interface NumberFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
}

export interface CheckboxFieldProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  checked?: boolean;
}

export interface RadioFieldProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
}

export interface TextareaFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  cols?: number;
}

export interface FileFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

// Form Data Types
export interface AuthFormData {
  email: string;
  password: string;
  name?: string; // For sign up
  confirmPassword?: string; // For sign up
}

export interface ProfileFormData {
  displayName: string;
  bio: string;
  dateOfBirth: string;
  location: string;
  profileImages: string[];
}

export interface RoomFormData {
  title: string;
  description: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  images: string[];
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isFlexibleTiming: boolean;
  maxGuests: number | undefined;
  minAge: number | undefined;
  maxAge: number | undefined;
  preferredGender: string[];
  eventImages: string[];
}

export interface MessageFormData {
  content: string;
  messageType?: "text" | "image";
  imageUrl?: string;
}

export interface ApplicationFormData {
  message?: string;
}

// Form Submission Types
export interface FormSubmissionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

export interface FormSubmissionHandler<T = unknown> {
  (data: T): Promise<FormSubmissionResult<T>>;
}

// Form Builder Types
export interface FormFieldConfig {
  name: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "file";
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRule | ValidationRule[];
  props?: Record<string, unknown>; // Additional props for specific field types
}

export interface FormConfig {
  fields: FormFieldConfig[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  resetOnSubmit?: boolean;
  onSubmit?: FormSubmissionHandler;
}

// Form Hook Types (for custom form logic)
export interface UseFormOptions<T = unknown> {
  initialValues: T;
  validationSchema?: ValidationRules;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T = unknown> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  validate: () => ValidationResult;
  reset: (values?: T) => void;
  handleSubmit: (e: Event) => void;
  getFieldProps: (field: keyof T) => unknown;
}

// File Upload Types
export interface FileUploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedUrls: string[];
}

export interface FileUploadOptions {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  onUploadComplete?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
}

// Form Context Types
export interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  setFieldValue: (field: string, value: unknown) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
  validate: () => boolean;
  reset: () => void;
}
