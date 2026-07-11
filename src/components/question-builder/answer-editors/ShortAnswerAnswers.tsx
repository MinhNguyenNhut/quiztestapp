import { TextField, Typography, Card, CardContent, FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

export default function ShortAnswerAnswers({ watch, setValue, index }: Props) {
  const { t } = useTranslation();
  const expectedAnswer = watch(`questions.${index}.expectedAnswer`);
  const caseSensitive = watch(`questions.${index}.caseSensitive`);

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
          value={expectedAnswer || ''}
          onChange={(e) =>
            setValue(`questions.${index}.expectedAnswer`, e.target.value, {
              shouldValidate: true,
            })
          }
          sx={{ mb: 2 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={caseSensitive || false}
              onChange={(e) =>
                setValue(`questions.${index}.caseSensitive`, e.target.checked, {
                  shouldValidate: false,
                })
              }
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
