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
