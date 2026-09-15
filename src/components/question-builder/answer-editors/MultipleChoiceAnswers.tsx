import { memo, useCallback } from 'react';
import { Box, TextField, IconButton, Button, Checkbox, FormControlLabel, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFieldArray, useController, type Control, type UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface OptionProps {
  control: Control<QuizFormValues>;
  index: number;
  optIdx: number;
}

const OptionTextField = memo(function OptionTextField({ control, index, optIdx }: OptionProps) {
  const { t } = useTranslation();
  const { field } = useController({ control, name: `questions.${index}.options.${optIdx}.text` });
  return (
    <TextField
      size="small"
      fullWidth
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      inputRef={field.ref}
      placeholder={t('answerEditors.optionPlaceholder', { letter: LABELS[optIdx] ?? optIdx + 1 })}
    />
  );
});

const OptionCorrectCheckbox = memo(function OptionCorrectCheckbox({ control, index, optIdx }: OptionProps) {
  const { field } = useController({ control, name: `questions.${index}.options.${optIdx}.isCorrect` });
  return (
    <Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} size="small" />
  );
});

function MultipleChoiceAnswers({ control, index }: Props) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: `questions.${index}.options` as const });

  const handleAdd = useCallback(() => {
    if (fields.length < 6) append({ text: '', isCorrect: false, order: fields.length });
  }, [append, fields.length]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          {t('answerEditors.multipleChoice.hint')}
        </Typography>
        {fields.map((field, optIdx) => (
          <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, p: 1, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f0' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 24, color: 'text.secondary' }}>
              {LABELS[optIdx] || optIdx}
            </Typography>
            <OptionTextField control={control} index={index} optIdx={optIdx} />
            <FormControlLabel
              control={<OptionCorrectCheckbox control={control} index={index} optIdx={optIdx} />}
              label=""
              sx={{ m: 0, minWidth: 40, justifyContent: 'center' }}
            />
            {fields.length > 2 && (
              <IconButton size="small" onClick={() => remove(optIdx)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
        {fields.length < 6 && (
          <Button startIcon={<AddIcon />} size="small" onClick={handleAdd} sx={{ mt: 1 }}>
            {t('answerEditors.addOption')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(MultipleChoiceAnswers);