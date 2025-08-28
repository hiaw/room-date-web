// Re-export form types from domain-specific modules
export * from "./domains/form-base";
export * from "./domains/form-validation";
export * from "./domains/form-fields";
export * from "./domains/form-data";

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
  validation?:
    | import("./domains/form-validation").ValidationRule
    | import("./domains/form-validation").ValidationRule[];
  props?: Record<string, unknown>;
}

// Form Hook Types
export interface UseFormOptions<T = unknown> {
  initialValues: T;
  validationSchema?: import("./domains/form-validation").ValidationRules;
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
  validate: () => import("./domains/form-validation").ValidationResult;
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
