import { Box, Typography, Card, CardContent, Button, Select, MenuItem, TextField, IconButton, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { QuizFormValues, QuestionType } from '../../../types/index.ts';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

const CHILD_TYPES: QuestionType[] = ['single_choice', 'multiple_choice', 'short_answer'];

export default function ReadingComprehensionAnswers({ watch, setValue, index }: Props) {
  const childQuestions = watch(`questions.${index}.childQuestions`) || [];
  const setChildValue = setValue as unknown as (path: string, value: unknown, options?: { shouldValidate?: boolean }) => void;
  const handleAddChild = useCallback(() => {
    const newChild = {
      id: uuidv4(),
      type: 'single_choice' as QuestionType,
      title: '',
      content: { html: '', text: '' },
      points: 1,
      difficulty: 'medium' as const,
      tags: [],
      order: childQuestions.length,
      options: [
        { id: uuidv4(), text: '', isCorrect: false, order: 0 },
        { id: uuidv4(), text: '', isCorrect: false, order: 1 },
      ],
    };
    setChildValue(`questions.${index}.childQuestions`, [...childQuestions, newChild], {
      shouldValidate: false,
    });
  }, [childQuestions, setChildValue, index]);

  const handleRemoveChild = useCallback(
    (childIdx: number) => {
      const updated = childQuestions.filter((_, i) => i !== childIdx);
      setChildValue(`questions.${index}.childQuestions`, updated, {
        shouldValidate: false,
      });
    },
    [childQuestions, setChildValue, index],
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Reading Comprehension
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the reading passage in the Question Content editor above. Add child questions below.
        </Typography>

        {childQuestions.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ mb: 2, fontStyle: 'italic' }}>
            No child questions yet. Click below to add one.
          </Typography>
        )}

        {childQuestions.map((child, childIdx) => (
          <Box
            key={child.id}
            sx={{
              p: 1.5,
              mb: 1.5,
              bgcolor: '#fafafa',
              borderRadius: 1,
              border: '1px solid #f0f0f0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 20 }}>
                {childIdx + 1}.
              </Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={child.type}
                  onChange={(e) =>
                    setChildValue(`questions.${index}.childQuestions.${childIdx}.type`, e.target.value as QuestionType, {
                      shouldValidate: false,
                    })
                  }
                >
                  {CHILD_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t === 'single_choice' ? 'Single Choice' : t === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton size="small" onClick={() => handleRemoveChild(childIdx)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
            <TextField
              size="small"
              fullWidth
              placeholder="Question title"
              value={child.title || ''}
              onChange={(e) =>
                setChildValue(`questions.${index}.childQuestions.${childIdx}.title`, e.target.value, {
                  shouldValidate: false,
                })
              }
            />
            {child.type !== 'short_answer' && child.options && (
              <Box sx={{ mt: 1, pl: 2 }}>
                {child.options.map((opt, optIdx) => (
                  <TextField
                    key={optIdx}
                    size="small"
                    fullWidth
                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                    value={opt.text || ''}
                    onChange={(e) =>
                      setChildValue(
                        `questions.${index}.childQuestions.${childIdx}.options.${optIdx}.text`,
                        e.target.value,
                        { shouldValidate: false },
                      )
                    }
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
        <Button startIcon={<AddIcon />} size="small" onClick={handleAddChild}>
          Add Child Question
        </Button>
      </CardContent>
    </Card>
  );
}
