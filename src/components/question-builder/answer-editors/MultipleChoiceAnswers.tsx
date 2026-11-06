import { memo, useCallback } from 'react';
import { Box, TextField, IconButton, Button, Checkbox, FormControlLabel, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useFieldArray, useController, type Control, type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { useOptionDrag } from './useOptionDrag.ts';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
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

function MultipleChoiceAnswers({ control, setValue, getValues, index }: Props) {
  const { t } = useTranslation();
  const optionsPath = `questions.${index}.options` as const;
  const { fields, append, remove, swap } = useFieldArray({ control, name: optionsPath });
  const reorderOptions = useCallback((from: number, to: number) => {
    swap(from, to);
    getValues(optionsPath).forEach((option, optionIndex) => {
      if (option.order !== optionIndex) {
        setValue(`${optionsPath}.${optionIndex}.order`, optionIndex, { shouldDirty: true });
      }
    });
  }, [getValues, optionsPath, setValue, swap]);
  const drag = useOptionDrag(reorderOptions);

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
          <Box
            key={field.id}
            data-option-row
            data-option-id={field.id}
            data-option-index={optIdx}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, p: 1, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
          >
            <IconButton
              size="small"
              aria-label={t('answerEditors.dragOption')}
              onPointerDown={(event) => drag.onPointerDown(optIdx, event)}
              onPointerUp={drag.onPointerUp}
              onPointerCancel={drag.onPointerCancel}
              sx={{ cursor: 'grab', touchAction: 'none', '&:active': { cursor: 'grabbing' } }}
            >
              <DragIndicatorIcon fontSize="small" />
            </IconButton>
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