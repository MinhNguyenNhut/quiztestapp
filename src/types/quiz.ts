/**
 * Quiz data model — shared by the builder, the candidate-info page, the
 * exam page, and the result page. The shape is configuration-driven: a
 * `Quiz` is just metadata + a `CandidateForm` config + a list of
 * `Question` documents. Nothing is hard-coded per page.
 */

import type { CandidateFieldsConfig } from './candidate';

/** Question types supported by the platform. */
export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_blank'
  | 'matching'
  | 'reading_comprehension'
  | 'short_answer'
  | 'essay';

/** Difficulty levels. */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Rich text content block. `html` is the rendered markup; `text` is the
 * plain-text fallback (used for snippets, tooltips, screen readers, etc.). */
export interface RichTextContent {
  html: string;
  text: string;
  blanks?: BlankDefinition[];
}

/** Definition of a single blank in a fill-in-the-blank question. */
export interface BlankDefinition {
  id: string;
  label: string;
  correctAnswer?: string;
}

/** A single key/value pair in a matching question. */
export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

/** A radio/checkbox option. */
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

/**
 * `Question` is a single test item. Per-type fields are optional because
 * not every type uses every field — we rely on the `type` discriminator
 * rather than splitting into eight subtypes to keep the data model flat
 * and JSON-friendly.
 */
export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  content: RichTextContent;
  description?: string;
  points: number;
  difficulty: Difficulty;
  topic?: string;
  tags: string[];
  estimatedTime?: number;
  order: number;
  options: QuestionOption[];
  explanation?: RichTextContent;
  blanks?: BlankDefinition[];
  matchingPairs?: MatchingPair[];
  passage?: RichTextContent;
  childQuestions?: Question[];
  expectedAnswer?: string;
  caseSensitive?: boolean;
  rubric?: RichTextContent;
  scoringGuide?: string;
}

/**
 * Top-level quiz document. `metadata` is presentation metadata surfaced
 * on the candidate-info and result pages; the questions themselves are
 * rendered into the exam page from `questions[]`.
 */
export interface Quiz {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  estimatedTime?: number;
  passingScore?: number;
  difficulty: Difficulty;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  /** Owner-defined candidate-info field config. If absent, the app falls
   * back to a shared default (first name, last name, email). */
  candidateFieldsConfig?: CandidateFieldsConfig;
  questions: Question[];
}

// ---- Human-facing labels & colors ----

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: 'Single Choice',
  multiple_choice: 'Multiple Choice',
  true_false: 'True / False',
  fill_in_blank: 'Fill in the Blank',
  matching: 'Matching',
  reading_comprehension: 'Reading Comprehension',
  short_answer: 'Short Answer',
  essay: 'Essay',
};

export const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  single_choice: 'radio_button_checked',
  multiple_choice: 'check_box',
  true_false: 'toggle_on',
  fill_in_blank: 'edit_note',
  matching: 'compare_arrows',
  reading_comprehension: 'menu_book',
  short_answer: 'short_text',
  essay: 'article',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444',
};

// ---- Form value shape (used by the builder's React Hook Form) ----

export interface QuizFormValues {
  title: string;
  description: string;
  questions: QuestionFormValues[];
}

export interface QuestionFormValues {
  id?: string;
  type: QuestionType;
  title: string;
  content: RichTextContent;
  description?: string;
  points: number;
  difficulty: Difficulty;
  topic?: string;
  tags: string[];
  estimatedTime?: number;
  options: { id?: string; text: string; isCorrect: boolean; order?: number }[];
  explanation?: RichTextContent;
  blanks?: BlankDefinition[];
  matchingPairs?: MatchingPair[];
  passage?: RichTextContent;
  childQuestions?: QuestionFormValues[];
  expectedAnswer?: string;
  caseSensitive?: boolean;
  rubric?: RichTextContent;
  scoringGuide?: string;
}
