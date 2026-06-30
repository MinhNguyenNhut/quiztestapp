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

export interface CandidateField {
  id: string;
  type: CandidateFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: CandidateFieldOption[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
  order?: number;
  section?: string;
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

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444',
};