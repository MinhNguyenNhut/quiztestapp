import { memo, useCallback } from 'react';
import { Box, TextField, IconButton, Button, Typography, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useFieldArray, useController, type Control, type UseFormSetValue, type UseFormGetValues } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: UseFormGetValues<QuizFormValues>;
  index: number;
}

interface BlankAnswerFieldProps {
  control: Control<QuizFormValues>;
  index: number;
  blankIdx: number;
  label: string;
}

const BlankAnswerField = memo(function BlankAnswerField({ control, index, blankIdx, label }: BlankAnswerFieldProps) {
  const { t } = useTranslation();
  const { field } = useController({ control, name: `questions.${index}.blanks.${blankIdx}.correctAnswer` });
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 80, color: 'primary.main' }}>
        {label}
      </Typography>
      <TextField
        size="small"
        fullWidth
        placeholder={t('answerEditors.fillBlank.correctAnswerPlaceholder')}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
        name={field.name}
        inputRef={field.ref}
      />
    </Box>
  );
});

function FillInBlankAnswers({ control, index }: Props) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: `questions.${index}.blanks` as const });

  const handleAddBlank = useCallback(() => {
    append({ id: uuidv4(), label: t('answerEditors.fillBlank.blankLabel', { number: fields.length + 1 }), correctAnswer: '' });
  }, [append, fields.length, t]);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('answerEditors.fillBlank.title')}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('answerEditors.fillBlank.description')}</Typography>
        {fields.map((blank, blankIdx) => (
          <Box key={blank.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, p: 1.5, bgcolor: '#fafafa', borderRadius: 1, border: '1px solid #f0f0f0' }}>
            <BlankAnswerField control={control} index={index} blankIdx={blankIdx} label={blank.label} />
            <IconButton size="small" onClick={() => remove(blankIdx)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} size="small" onClick={handleAddBlank} sx={{ mt: 1 }}>
          {t('answerEditors.fillBlank.addBlank')}
        </Button>
      </CardContent>
    </Card>
  );
}

export default memo(FillInBlankAnswers);