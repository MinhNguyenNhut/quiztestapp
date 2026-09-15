import { memo } from 'react';
import { TextField, Typography, Card, CardContent, FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useController, type Control, type UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

function ShortAnswerAnswers({ control, index }: Props) {
  const { t } = useTranslation();
  const { field: answerField } = useController({ control, name: `questions.${index}.expectedAnswer` });
  const { field: caseSensitiveField } = useController({ control, name: `questions.${index}.caseSensitive` });

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          {t('answerEditors.shortAnswer.title')}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label={t('answerEditors.shortAnswer.expectedAnswerLabel')}
          placeholder={t('answerEditors.shortAnswer.expectedAnswerPlaceholder')}
          value={answerField.value ?? ''}
          onChange={answerField.onChange}
          onBlur={answerField.onBlur}
          name={answerField.name}
          inputRef={answerField.ref}
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={!!caseSensitiveField.value}
              onChange={(e) => caseSensitiveField.onChange(e.target.checked)}
            />
          }
          label={t('answerEditors.shortAnswer.caseSensitiveLabel')}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {t('answerEditors.shortAnswer.caseSensitiveHelper')}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default memo(ShortAnswerAnswers);