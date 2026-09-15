import { memo } from 'react';
import { TextField, Typography, Card, CardContent, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfoIcon from '@mui/icons-material/Info';
import { useController, type Control, type UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  getValues: () => QuizFormValues;
  index: number;
}

function EssayAnswers({ control, index }: Props) {
  const { t } = useTranslation();
  const { field } = useController({ control, name: `questions.${index}.scoringGuide` });

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>{t('answerEditors.essay.configTitle')}</Typography>
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
          {t('answerEditors.essay.manualGradingAlert')}
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('answerEditors.essay.scoringGuideLabel')}
          placeholder={t('answerEditors.essay.scoringGuidePlaceholder')}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          name={field.name}
          inputRef={field.ref}
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="text.secondary">{t('answerEditors.essay.tip')}</Typography>
      </CardContent>
    </Card>
  );
}

export default memo(EssayAnswers);