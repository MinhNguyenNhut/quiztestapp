import { Typography, Card, CardContent } from '@mui/material';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { QuizFormValues, QuestionType } from '../../../types/index.ts';
import DynamicAnswerEditor from '../answer-editors/DynamicAnswerEditor.tsx';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  questionType: QuestionType;
  index: number;
}

export default function AnswersSection({
  control,
  errors,
  watch,
  setValue,
  getValues,
  questionType,
  index,
}: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Answers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure the correct answer(s) for this question
        </Typography>
        <DynamicAnswerEditor
          control={control}
          errors={errors}
          watch={watch}
          setValue={setValue}
          getValues={getValues}
          type={questionType}
          index={index}
        />
      </CardContent>
    </Card>
  );
}
