import { Box, TextField, IconButton, Button, Typography, Card, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue, UseFormGetValues } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  index: number;
}

export default function FillInBlankAnswers({ watch, setValue, index }: Props) {
  const blanks = watch(`questions.${index}.blanks`) || [];

  const handleAddBlank = useCallback(() => {
    const newBlank = { id: uuidv4(), label: `Blank ${blanks.length + 1}`, correctAnswer: '' };
    setValue(`questions.${index}.blanks`, [...blanks, newBlank], { shouldValidate: false });
  }, [blanks, setValue, index]);

  const handleRemoveBlank = useCallback(
    (blankIdx: number) => {
      const updated = blanks.filter((_, i) => i !== blankIdx);
      setValue(`questions.${index}.blanks`, updated, { shouldValidate: false });
    },
    [blanks, setValue, index],
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Fill in the Blanks
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use the "Add Blank" button in the editor to insert blanks into your question text. Configure correct answers below.
        </Typography>
        {blanks.map((blank, blankIdx) => (
          <Box
            key={blank.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 1.5,
              p: 1.5,
              bgcolor: '#fafafa',
              borderRadius: 1,
              border: '1px solid #f0f0f0',
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, minWidth: 80, color: 'primary.main' }}
            >
              {blank.label}
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Correct answer"
              value={blank.correctAnswer || ''}
              onChange={(e) =>
                setValue(`questions.${index}.blanks.${blankIdx}.correctAnswer`, e.target.value, {
                  shouldValidate: false,
                })
              }
            />
            <IconButton size="small" onClick={() => handleRemoveBlank(blankIdx)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} size="small" onClick={handleAddBlank} sx={{ mt: 1 }}>
          Add Blank
        </Button>
      </CardContent>
    </Card>
  );
}
