import { memo } from 'react';
import { Stack } from '@mui/material';
import type { Control, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { QuizFormValues, QuestionType } from '../../types/index.ts';
import QuestionContentSection from './sections/QuestionContentSection.tsx';
import MetadataSection from './sections/MetadataSection.tsx';
import AnswersSection from './sections/AnswersSection.tsx';
import ExplanationSection from './sections/ExplanationSection.tsx';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  questionType: QuestionType;
  index: number;
}

function QuestionEditor({ control, setValue, getValues, questionType, index }: Props) {
  return (
    <Stack spacing={3} sx={{ p: 3, overflowY: 'auto', flex: 1, minHeight: 0 }}>
      <QuestionContentSection control={control} setValue={setValue} getValues={getValues} index={index} />
      <MetadataSection control={control} setValue={setValue} index={index} />
      <AnswersSection control={control} setValue={setValue} getValues={getValues} questionType={questionType} index={index} />
      <ExplanationSection control={control} setValue={setValue} getValues={getValues} index={index} />
    </Stack>
  );
}

export default memo(QuestionEditor);