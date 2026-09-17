import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, Switch, FormControlLabel, Typography, Divider, TextField } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch } from '../../features/store';
import { updateQuiz } from '../../features/quiz/quizSlice';
import { useAlert } from '../../hooks/useAlert';
import AppAlert from '../common/AppAlert/AppAlert';
import { DEFAULT_QUIZ_SETTINGS } from '../../types';
import type { QuizSettings } from '../../types';

interface QuizSettingsBuilderProps {
  quizId: string;
  defaultSettings: QuizSettings;
}

export default function QuizSettingsBuilder({ quizId, defaultSettings }: QuizSettingsBuilderProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { alert, showAlert, closeAlert } = useAlert();

  const [settings, setSettings] = useState<QuizSettings>(defaultSettings ?? DEFAULT_QUIZ_SETTINGS);

  const handleChange = useCallback((key: keyof QuizSettings, value: boolean | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await dispatch(updateQuiz({ id: quizId, patch: { settings } })).unwrap();
      showAlert(t('quizSettings.settingsSaved'), 'success');
    } catch (err) {
      console.error(err);
      showAlert(t('quizSettings.saveFailed'), 'error');
    }
  }, [dispatch, quizId, settings, showAlert, t]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
        <Box>
          <Stack spacing={3}>

          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{t('quizSettings.title')}</Typography>
            <Typography variant="body2" color="text.secondary">{t('quizSettings.pageDesc')}</Typography>
          </Box>

          {/* Grading Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{t('quizSettings.gradingSection')}</Typography>
            <Stack spacing={1.5} direction={{ xs: 'column', sm: 'row' }} useFlexGap sx={{ alignItems: 'center' }}>
              <TextField
                type="number"
                label={t('quizSettings.passingScore')}
                value={settings.passingScorePercentage}
                onChange={(e) => handleChange('passingScorePercentage', Number(e.target.value))}
                sx={{ width: 150 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.unlimitedTime}
                    onChange={(e) => handleChange('unlimitedTime', e.target.checked)}
                    color="primary"
                  />
                }
                label={t('quizSettings.unlimitedTime')}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Result & Feedback Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{t('quizSettings.resultsSection')}</Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={<Switch checked={settings.showResultsPage} onChange={(e) => handleChange('showResultsPage', e.target.checked)} />}
                label={t('quizSettings.showResultsPage')}
              />
              <FormControlLabel
                control={<Switch checked={settings.showScore} onChange={(e) => handleChange('showScore', e.target.checked)} />}
                label={t('quizSettings.showScore')}
              />
              <FormControlLabel
                control={<Switch checked={settings.showPassFailStatus} onChange={(e) => handleChange('showPassFailStatus', e.target.checked)} />}
                label={t('quizSettings.showPassFailStatus')}
              />
              <FormControlLabel
                control={<Switch checked={settings.showCorrectAnswers} onChange={(e) => handleChange('showCorrectAnswers', e.target.checked)} />}
                label={t('quizSettings.showCorrectAnswers')}
              />
              <FormControlLabel
                control={<Switch checked={settings.showExplanations} onChange={(e) => handleChange('showExplanations', e.target.checked)} />}
                label={t('quizSettings.showExplanations')}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Attempt & Navigation Section */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{t('quizSettings.navigationSection')}</Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={<Switch checked={settings.allowRetry} onChange={(e) => handleChange('allowRetry', e.target.checked)} />}
                label={t('quizSettings.allowRetry')}
              />
              <TextField
                type="number"
                label={t('quizSettings.maxAttempts')}
                value={settings.maxAttempts}
                onChange={(e) => handleChange('maxAttempts', Number(e.target.value))}
                disabled={!settings.allowRetry}
                sx={{ width: 150, mt: 1 }}
              />
              <FormControlLabel
                control={<Switch checked={settings.shuffleQuestions} onChange={(e) => handleChange('shuffleQuestions', e.target.checked)} />}
                label={t('quizSettings.shuffleQuestions')}
              />
              <FormControlLabel
                control={<Switch checked={settings.shuffleOptions} onChange={(e) => handleChange('shuffleOptions', e.target.checked)} />}
                label={t('quizSettings.shuffleOptions')}
              />
              <FormControlLabel
                control={<Switch checked={settings.allowBackwardNavigation} onChange={(e) => handleChange('allowBackwardNavigation', e.target.checked)} />}
                label={t('quizSettings.allowBackwardNavigation')}
              />
            </Stack>
          </Box>

        </Stack>
        </Box>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave}>
          {t('common.save')}
        </Button>
      </Box>

      <AppAlert open={alert.open} message={alert.message} severity={alert.severity} onClose={closeAlert} />
    </Box>
  );
}