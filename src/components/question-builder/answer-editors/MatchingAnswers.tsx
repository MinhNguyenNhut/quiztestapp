import { Box, TextField, IconButton, Button, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { useCallback } from 'react';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

export default function MatchingAnswers({ control, watch, setValue, index }: Props) {
  const { t } = useTranslation();
  useFieldArray({
    control,
    name: `questions.${index}.matchingPairs` as const,
  });

  const pairs = watch(`questions.${index}.matchingPairs`) || [];

  const handleAdd = useCallback(() => {
    const updated = [...pairs, { id: `pair_${Date.now()}`, left: '', right: '' }];
    setValue(`questions.${index}.matchingPairs`, updated, { shouldValidate: false });
  }, [pairs, setValue, index]);

  const handleRemove = useCallback(
    (pairIdx: number) => {
      const updated = pairs.filter((_, i) => i !== pairIdx);
      setValue(`questions.${index}.matchingPairs`, updated, { shouldValidate: false });
    },
    [pairs, setValue, index],
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          {t('answerEditors.matching.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('answerEditors.matching.description')}
        </Typography>
        {pairs.map((pair, pairIdx) => (
          <Box
            key={pair.id}
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
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 24, color: 'text.secondary' }}>
              {pairIdx + 1}
            </Typography>
            <TextField
              size="small"
              placeholder={t('answerEditors.matching.leftPlaceholder')}
              value={pair.left || ''}
              onChange={(e) =>
                setValue(`questions.${index}.matchingPairs.${pairIdx}.left`, e.target.value, {
                  shouldValidate: false,
                })
              }
              sx={{ flex: 1 }}
            />
            <Typography variant="body2" color="text.secondary">↔</Typography>
            <TextField
              size="small"
              placeholder={t('answerEditors.matching.rightPlaceholder')}
              value={pair.right || ''}
              onChange={(e) =>
                setValue(`questions.${index}.matchingPairs.${pairIdx}.right`, e.target.value, {
                  shouldValidate: false,
                })
              }
              sx={{ flex: 1 }}
            />
            {pairs.length > 2 && (
              <IconButton size="small" onClick={() => handleRemove(pairIdx)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
        <Button startIcon={<AddIcon />} size="small" onClick={handleAdd} sx={{ mt: 1 }}>
          {t('answerEditors.matching.addPair')}
        </Button>
      </CardContent>
    </Card>
  );
}
