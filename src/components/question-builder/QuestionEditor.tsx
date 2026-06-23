import { Stack } from '@mui/material';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { QuizFormValues, QuestionType } from '../../types/index.ts';
import QuestionContentSection from './sections/QuestionContentSection.tsx';
import MetadataSection from './sections/MetadataSection.tsx';
import AnswersSection from './sections/AnswersSection.tsx';
import ExplanationSection from './sections/ExplanationSection.tsx';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  questionType: QuestionType;
  index: number;
}

export default function QuestionEditor({
  control,
  errors,
  watch,
  setValue,
  getValues,
  questionType,
  index,
}: Props) {
  return (
    <Stack spacing={3} sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
      <QuestionContentSection
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        index={index}
      />
      <MetadataSection
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        index={index}
      />
      <AnswersSection
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        getValues={getValues}
        questionType={questionType}
        index={index}
      />
      <ExplanationSection
        control={control}
        errors={errors}
        watch={watch}
        setValue={setValue}
        index={index}
      />
    </Stack>
  );
}
