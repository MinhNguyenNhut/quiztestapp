import {
  Box,
  TextField,
  IconButton,
  Button,
  Radio,
  FormControlLabel,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { memo, useCallback } from 'react';
import {
  useFieldArray,
  useController,
  type Control,
  type UseFormSetValue,
  type UseFormGetValues,
} from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { v4 as uuidv4 } from 'uuid';
import { useOptionDrag } from './useOptionDrag.ts';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  index: number;
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface OptionCorrectRadioProps {
  control: Control<QuizFormValues>;
  index: number;
  optIdx: number;
  onChange: (optionIndex: number) => void;
}

const OptionCorrectRadio = memo(function OptionCorrectRadio({
  control,
  index,
  optIdx,
  onChange,
}: OptionCorrectRadioProps) {
  const { field } = useController({
    control,
    name: `questions.${index}.options.${optIdx}.isCorrect`,
  });

  return (
    <Radio
      checked={!!field.value}
      onChange={() => onChange(optIdx)}
      size="small"
    />
  );
});

interface OptionTextFieldProps {
  control: Control<QuizFormValues>;
  index: number;
  optIdx: number;
}

const OptionTextField = memo(function OptionTextField({
  control,
  index,
  optIdx,
}: OptionTextFieldProps) {
  const { t } = useTranslation();

  const { field } = useController({
    control,
    name: `questions.${index}.options.${optIdx}.text`,
  });

  return (
    <TextField
      size="small"
      fullWidth
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      inputRef={field.ref}
      placeholder={t(
        'answerEditors.optionPlaceholder',
        {
          letter: LABELS[optIdx] ?? optIdx + 1,
        },
      )}
    />
  );
})

export default memo(function SingleChoiceAnswers({ control, setValue, getValues, index }: Props) {
  const { t } = useTranslation();

  const optionsPath = `questions.${index}.options` as const;
  const {
    fields,
    append,
    remove,
    swap,
  } = useFieldArray({
    control,
    name: optionsPath,
  });
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
    if (fields.length >= 6) return;

    append({
      id: uuidv4(),
      text: '',
      isCorrect: false,
      order: fields.length,
    });
  }, [append, fields.length]);

  const handleCorrectChange = useCallback(
    (optionIndex: number) => {
      fields.forEach((_, i) => {
        setValue(
          `questions.${index}.options.${i}.isCorrect`,
          i === optionIndex,
          {
            shouldDirty: true,
            shouldValidate: false,
          },
        );
      });
    },
    [fields, setValue, index],
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'unset',
      }}
    >
      <CardContent>
        <Typography
          variant="subtitle2"
          sx={{ mb: 2 }}
        >
          {t('answerEditors.singleChoice.title')}
        </Typography>

        {fields.map((field, optIdx) => (
          <Box
            key={field.id}
            data-option-row
            data-option-id={field.id}
            data-option-index={optIdx}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
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
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                minWidth: 24,
                color: 'text.secondary',
              }}
            >
              {LABELS[optIdx] ?? optIdx + 1}
            </Typography>

            <OptionTextField
              control={control}
              index={index}
              optIdx={optIdx}
            />

            <FormControlLabel
              control={
                <OptionCorrectRadio
                  control={control}
                  index={index}
                  optIdx={optIdx}
                  onChange={handleCorrectChange}
                />
              }
              label=""
              sx={{
                m: 0,
                minWidth: 40,
                justifyContent: 'center',
              }}
            />

            {fields.length > 2 && (
              <IconButton
                size="small"
                onClick={() => remove(optIdx)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}

        {fields.length < 6 && (
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={handleAdd}
            sx={{ mt: 1 }}
          >
            {t('answerEditors.addOption')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
