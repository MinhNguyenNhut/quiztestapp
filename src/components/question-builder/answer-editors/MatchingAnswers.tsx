import { memo, useCallback } from 'react';
import { Box, TextField, IconButton, Button, Typography, Card, CardContent } from '@mui/material';
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

interface PairSideFieldProps {
  control: Control<QuizFormValues>;
  index: number;
  pairIdx: number;
  side: 'left' | 'right';
  placeholder: string;
}

const PairSideField = memo(function PairSideField({ control, index, pairIdx, side, placeholder }: PairSideFieldProps) {
  const { field } = useController({ control, name: `questions.${index}.matchingPairs.${pairIdx}.${side}` });
  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
      name={field.name}
      inputRef={field.ref}
      sx={{ flex: 1 }}
    />
  );
});

function MatchingAnswers({ control, index }: Props) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: `questions.${index}.matchingPairs` as const });

  const handleAdd = useCallback(() => {
    append({ id: `pair_${Date.now()}`, left: '', right: '' });
  }, [append]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>{t('answerEditors.matching.title')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('answerEditors.matching.description')}</Typography>
        {fields.map((pair, pairIdx) => (
          <Box key={pair.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f0' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 24, color: 'text.secondary' }}>{pairIdx + 1}</Typography>
            <PairSideField control={control} index={index} pairIdx={pairIdx} side="left" placeholder={t('answerEditors.matching.leftPlaceholder')} />
            <Typography variant="body2" color="text.secondary">↔</Typography>
            <PairSideField control={control} index={index} pairIdx={pairIdx} side="right" placeholder={t('answerEditors.matching.rightPlaceholder')} />
            {fields.length > 2 && (
              <IconButton size="small" onClick={() => remove(pairIdx)} color="error">
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

export default memo(MatchingAnswers);