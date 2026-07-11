import { TextField, Typography, Card, CardContent, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import InfoIcon from '@mui/icons-material/Info';
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

export default function EssayAnswers({ watch, setValue, index }: Props) {
  const { t } = useTranslation();
  const scoringGuide = watch(`questions.${index}.scoringGuide`);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          {t('answerEditors.essay.configTitle')}
        </Typography>
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
          {t('answerEditors.essay.manualGradingAlert')}
        </Alert>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={t('answerEditors.essay.scoringGuideLabel')}
          placeholder={t('answerEditors.essay.scoringGuidePlaceholder')}
          value={scoringGuide || ''}
          onChange={(e) =>
            setValue(`questions.${index}.scoringGuide`, e.target.value, {
              shouldValidate: false,
            })
          }
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="text.secondary">
          {t('answerEditors.essay.tip')}
        </Typography>
      </CardContent>
    </Card>
  );
}
