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
import { memo, useCallback } from 'react';
import {
  useFieldArray,
  useController,
  type Control,
  type FieldErrors,
  type UseFormWatch,
  type UseFormSetValue,
  type UseFormGetValues,
} from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  index: number;
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

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

export default function SingleChoiceAnswers({
  control,
  setValue,
  index,
}: Props) {
  const { t } = useTranslation();

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

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
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
              p: 1,
              bgcolor: '#fafafa',
              borderRadius: 1,
              border: '1px solid #f0f0f0',
            }}
          >
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
                <Radio
                  checked={false}
                  onChange={() =>
                    handleCorrectChange(optIdx)
                  }
                  size="small"
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
}
