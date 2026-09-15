import { memo, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Button, Select, MenuItem, TextField, IconButton, FormControl } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFieldArray, useController, useWatch, type Control, type UseFormSetValue, type Path } from 'react-hook-form';
import type { QuizFormValues, QuestionType, CandidateFieldOption, QuestionFormValues } from '../../../types/index.ts';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

const CHILD_TYPES: QuestionType[] = ['single_choice', 'multiple_choice', 'short_answer'];
const CHILD_TYPE_LABEL_KEYS: Record<string, string> = {
  single_choice: 'singleChoice',
  multiple_choice: 'multipleChoice',
  short_answer: 'shortAnswer',
};

interface ChildQuestionFieldValue extends QuestionFormValues {
  id: string;
}

interface ChildTitleFieldProps {
  control: Control<QuizFormValues>;
  index: number;
  childIdx: number;
}

const ChildTitleField = memo(function ChildTitleField({ control, index, childIdx }: ChildTitleFieldProps) {
  const { t } = useTranslation();
  const { field } = useController({
    control,
    name: `questions.${index}.childQuestions.${childIdx}.title` as Path<QuizFormValues>,
  });
  return (
    <TextField
      size="small"
      fullWidth
      placeholder={t('answerEditors.readingComprehension.questionTitlePlaceholder')}
      value={(field.value as string) ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      inputRef={field.ref}
    />
  );
});

interface ChildOptionFieldProps {
  control: Control<QuizFormValues>;
  index: number;
  childIdx: number;
  optIdx: number;
}

const ChildOptionField = memo(function ChildOptionField({ control, index, childIdx, optIdx }: ChildOptionFieldProps) {
  const { t } = useTranslation();
  const { field } = useController({
    control,
    name: `questions.${index}.childQuestions.${childIdx}.options.${optIdx}.text` as Path<QuizFormValues>,
  });
  return (
    <TextField
      size="small"
      fullWidth
      placeholder={t('answerEditors.optionPlaceholder', { letter: String.fromCharCode(65 + optIdx) })}
      value={(field.value as string) ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      inputRef={field.ref}
      sx={{ mb: 0.5 }}
    />
  );
});

interface ChildTypeSelectProps {
  control: Control<QuizFormValues>;
  index: number;
  childIdx: number;
}

const ChildTypeSelect = memo(function ChildTypeSelect({ control, index, childIdx }: ChildTypeSelectProps) {
  const { t } = useTranslation();
  const { field } = useController({
    control,
    name: `questions.${index}.childQuestions.${childIdx}.type` as Path<QuizFormValues>,
  });
  const value = field.value as QuestionType;
  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <Select value={value} onChange={(e) => field.onChange(e.target.value as QuestionType)}>
        {CHILD_TYPES.map((ct) => (
          <MenuItem key={ct} value={ct}>{t(`questionTypes.${CHILD_TYPE_LABEL_KEYS[ct]}`)}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});

interface ChildOptionsListProps {
  control: Control<QuizFormValues>;
  index: number;
  childIdx: number;
}

const ChildOptionsList = memo(function ChildOptionsList({ control, index, childIdx }: ChildOptionsListProps) {
  const type = useWatch({
    control,
    name: `questions.${index}.childQuestions.${childIdx}.type` as Path<QuizFormValues>,
  }) as QuestionType | undefined;
  const options = useWatch({
    control,
    name: `questions.${index}.childQuestions.${childIdx}.options` as Path<QuizFormValues>,
  }) as CandidateFieldOption[] | undefined;

  if (type === 'short_answer' || !options) return null;

  return (
    <Box sx={{ mt: 1, pl: 2 }}>
      {options.map((_, optIdx) => (
        <ChildOptionField key={optIdx} control={control} index={index} childIdx={childIdx} optIdx={optIdx} />
      ))}
    </Box>
  );
});

// A minimal, local FieldValues shape just for this one useFieldArray call —
// avoids `any` while sidestepping RHF's recursion-depth limit on the real
// (self-referential) QuizFormValues type.
interface ChildQuestionsContainer {
  questions: { childQuestions: ChildQuestionFieldValue[] }[];
}

function ReadingComprehensionAnswers({ control, index }: Props) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({
    control: control as unknown as Control<ChildQuestionsContainer>,
    name: `questions.${index}.childQuestions`,
  });
  const childFields = fields as unknown as ChildQuestionFieldValue[];

  const handleAddChild = useCallback(() => {
    append({
      id: uuidv4(),
      type: 'single_choice' as QuestionType,
      title: '',
      content: { html: '', text: '' },
      points: 1,
      difficulty: 'medium' as const,
      tags: [],
      options: [
        { id: uuidv4(), text: '', isCorrect: false, order: 0 },
        { id: uuidv4(), text: '', isCorrect: false, order: 1 },
      ],
    });
  }, [append]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>{t('answerEditors.readingComprehension.title')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('answerEditors.readingComprehension.description')}</Typography>

        {childFields.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2, fontStyle: 'italic' }}>
            {t('answerEditors.readingComprehension.noChildQuestions')}
          </Typography>
        )}

        {childFields.map((child, childIdx) => (
          <Box key={child.id} sx={{ p: 1.5, mb: 1.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 20 }}>{childIdx + 1}.</Typography>
              <ChildTypeSelect control={control} index={index} childIdx={childIdx} />
              <IconButton size="small" onClick={() => remove(childIdx)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <ChildTitleField control={control} index={index} childIdx={childIdx} />
            <ChildOptionsList control={control} index={index} childIdx={childIdx} />
          </Box>
        ))}
        <Button startIcon={<AddIcon />} size="small" onClick={handleAddChild}>
          {t('answerEditors.readingComprehension.addChildQuestion')}
        </Button>
      </CardContent>
    </Card>
  );
}

export default memo(ReadingComprehensionAnswers);