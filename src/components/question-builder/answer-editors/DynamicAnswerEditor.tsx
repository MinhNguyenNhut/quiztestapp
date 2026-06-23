import type { Control, FieldErrors, UseFormWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { QuizFormValues, QuestionType } from '../../../types/index.ts';
import SingleChoiceAnswers from './SingleChoiceAnswers.tsx';
import MultipleChoiceAnswers from './MultipleChoiceAnswers.tsx';
import TrueFalseAnswers from './TrueFalseAnswers.tsx';
import FillInBlankAnswers from './FillInBlankAnswers.tsx';
import MatchingAnswers from './MatchingAnswers.tsx';
import ReadingComprehensionAnswers from './ReadingComprehensionAnswers.tsx';
import ShortAnswerAnswers from './ShortAnswerAnswers.tsx';
import EssayAnswers from './EssayAnswers.tsx';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  type: QuestionType;
  index: number;
}

export default function DynamicAnswerEditor({ control, errors, watch, setValue, getValues, type, index }: Props) {
  const sharedProps = { control, errors, watch, setValue, getValues, index };

  switch (type) {
    case 'single_choice':
      return <SingleChoiceAnswers {...sharedProps} />;
    case 'multiple_choice':
      return <MultipleChoiceAnswers {...sharedProps} />;
    case 'true_false':
      return <TrueFalseAnswers {...sharedProps} />;
    case 'fill_in_blank':
      return <FillInBlankAnswers {...sharedProps} />;
    case 'matching':
      return <MatchingAnswers {...sharedProps} />;
    case 'reading_comprehension':
      return <ReadingComprehensionAnswers {...sharedProps} />;
    case 'short_answer':
      return <ShortAnswerAnswers {...sharedProps} />;
    case 'essay':
      return <EssayAnswers {...sharedProps} />;
    default:
      return null;
  }
}
