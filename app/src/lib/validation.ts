export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidation {
  [field: string]: ValidationRule;
}

// Indonesian phone number pattern (without +62 prefix)
// Accepts: 812xxxxxxxx, 8123456789, etc.
export const PHONE_PATTERN = /^8[0-9]{8,12}$/;

// Validation messages in Indonesian
const MESSAGES = {
  required: 'Field ini wajib diisi',
  minLength: (min: number) => `Minimal ${min} karakter`,
  maxLength: (max: number) => `Maksimal ${max} karakter`,
  invalidPhone: 'Format nomor tidak valid (contoh: 81234567890)',
};

export function validateField(value: string, rules: ValidationRule): string | null {
  const trimmedValue = value.trim();

  if (rules.required && !trimmedValue) {
    return rules.message || MESSAGES.required;
  }

  if (trimmedValue && rules.minLength && trimmedValue.length < rules.minLength) {
    return rules.message || MESSAGES.minLength(rules.minLength);
  }

  if (trimmedValue && rules.maxLength && trimmedValue.length > rules.maxLength) {
    return rules.message || MESSAGES.maxLength(rules.maxLength);
  }

  if (trimmedValue && rules.pattern && !rules.pattern.test(trimmedValue)) {
    return rules.message || 'Format tidak valid';
  }

  return null;
}

export function validateForm<T extends Record<string, string>>(
  data: T,
  schema: FieldValidation
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field] || '';
    const error = validateField(value, rules);
    if (error) {
      errors[field] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Step 1 validation schema
export const step1Schema: FieldValidation = {
  businessName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Nama bisnis wajib diisi (2-100 karakter)',
  },
  whatsapp: {
    required: true,
    pattern: PHONE_PATTERN,
    message: MESSAGES.invalidPhone,
  },
  category: {
    required: true,
    message: 'Pilih kategori bisnis',
  },
};

// Validate Step 1 form
export function validateStep1(data: {
  businessName: string;
  whatsapp: string;
  category: string;
  location?: string;
}): ValidationResult {
  return validateForm(data, step1Schema);
}
