/**
 * AnswerRenderer — switches on the question type to the matching
 * per-type component. Per-type components read/write their answer via
 * the Redux store, not via React Hook Form, so the exam page stays
 * decoupled from form state.
 */
import type { Question } from '../../../types/quiz';
import { SingleChoiceAnswer } from './SingleChoiceAnswer';
import { MultipleChoiceAnswer } from './MultipleChoiceAnswer';
import { TrueFalseAnswer } from './TrueFalseAnswer';
import { FillInBlankAnswer } from './FillInBlankAnswer';
import { MatchingAnswer } from './MatchingAnswer';
import { ShortAnswerAnswer } from './ShortAnswerAnswer';
import { EssayAnswer } from './EssayAnswer';
import { ReadingComprehensionAnswer } from './ReadingComprehensionAnswer';

interface AnswerRendererProps {
  question: Question;
}

export const AnswerRenderer = ({ question }: AnswerRendererProps) => {
  switch (question.type) {
    case 'single_choice':
      return <SingleChoiceAnswer question={question} />;
    case 'multiple_choice':
      return <MultipleChoiceAnswer question={question} />;
    case 'true_false':
      return <TrueFalseAnswer question={question} />;
    case 'fill_in_blank':
      return <FillInBlankAnswer question={question} />;
    case 'matching':
      return <MatchingAnswer question={question} />;
    case 'short_answer':
      return <ShortAnswerAnswer question={question} />;
    case 'essay':
      return <EssayAnswer question={question} />;
    case 'reading_comprehension':
      return <ReadingComprehensionAnswer question={question} />;
    default:
      return null;
  }
};
