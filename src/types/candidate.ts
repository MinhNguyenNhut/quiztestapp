/**
 * Candidate Information Field Types
 * Configuration-driven form fields for candidate pre-exam information
 */

export type CandidateFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'date'
  | 'number';

export interface CandidateFieldOption {
  label: string;
  value: string;
}

/**
 * Conditional visibility rule — `visibleIf` lets one field's visibility
 * depend on another field's value (e.g. show "Other gender" only when
 * gender === 'other').
 */
export interface FieldVisibilityRule {
  /** The id of the field whose value is being inspected. */
  fieldId: string;
  /** The value the field must equal for this field to be visible. */
  equals: string | number | boolean;
}

export interface CandidateField {
  id: string;
  type: CandidateFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean;
  required?: boolean;
  options?: CandidateFieldOption[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  order?: number;
  section?: string;
  visibleIf?: FieldVisibilityRule;
}

export interface CandidateFieldSection {
  id: string;
  title: string;
  order?: number;
}

export interface CandidateFieldsConfig {
  fields: CandidateField[];
  sections?: CandidateFieldSection[];
}

export interface QuizOverview {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  estimatedTime?: number;
  questionCount: number;
  passingScore?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy?: string;
  createdAt?: string;
}

/**
 * Loose record of form values keyed by field id. Values are coerced
 * to strings when persisted to `sessionStorage`; callers that need
 * numbers/booleans should cast at the use site.
 */
export interface CandidateFormValues {
  [key: string]: string | number | boolean | string[] | undefined;
}

export const FIELD_TYPE_LABELS: Record<CandidateFieldType, string> = {
  text: 'Text',
  email: 'Email',
  phone: 'Phone',
  select: 'Dropdown',
  radio: 'Radio Group',
  checkbox: 'Checkbox',
  textarea: 'Text Area',
  date: 'Date',
  number: 'Number',
};

export const FIELD_TYPE_ICONS: Record<CandidateFieldType, string> = {
  text: 'text_fields',
  email: 'email',
  phone: 'phone',
  select: 'arrow_drop_down_circle',
  radio: 'radio_button_checked',
  checkbox: 'check_box',
  textarea: 'notes',
  date: 'calendar_today',
  number: 'pin',
};
