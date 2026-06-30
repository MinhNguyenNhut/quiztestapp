export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

// Re-export candidate types
export * from './candidate';

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_blank'
  | 'matching'
  | 'reading_comprehension'
  | 'short_answer'
  | 'essay';

export type Difficulty = 'easy' | 'medium' | 'hard';

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

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface RichTextContent {
  html: string;
  text: string;
  blanks?: BlankDefinition[];
}

export interface BlankDefinition {
  id: string;
  label: string;
  correctAnswer: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

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
