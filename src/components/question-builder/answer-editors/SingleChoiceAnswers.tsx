import { useCallback } from 'react';
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
  FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function SingleChoiceAnswers({ control, watch, setValue, index }: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options` as const,
  });

  const watchOptions = watch(`questions.${index}.options`);

  const handleAdd = useCallback(() => {
    if (fields.length < 6) {
      append({ text: '', isCorrect: false, order: fields.length });
    }
  }, [append, fields.length]);

  const handleCorrectChange = useCallback(
    (optionIndex: number) => {
      const updated = watchOptions?.map((opt, i) => ({
        text: opt?.text || '',
        isCorrect: i === optionIndex,
        order: i,
      }));
      setValue(`questions.${index}.options`, updated, { shouldValidate: false });
    },
    [watchOptions, setValue, index],
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Options
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
              sx={{ fontWeight: 700, minWidth: 24, color: 'text.secondary' }}
            >
              {LABELS[optIdx] || optIdx}
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder={`Option ${LABELS[optIdx] || optIdx + 1}`}
              value={watchOptions?.[optIdx]?.text || ''}
              onChange={(e) =>
                setValue(`questions.${index}.options.${optIdx}.text`, e.target.value, {
                  shouldValidate: false,
                })
              }
            />
            <FormControlLabel
              control={
                <Radio
                  checked={watchOptions?.[optIdx]?.isCorrect || false}
                  onChange={() => handleCorrectChange(optIdx)}
                  size="small"
                />
              }
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
            Add Option
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
