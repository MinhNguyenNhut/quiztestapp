import { memo } from 'react';
import { Box, Typography, Card, CardContent, Select, MenuItem, FormControl, InputLabel, Stack, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Controller, type Control, type UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues, Difficulty } from '../../../types/index.ts';
import { DIFFICULTY_COLORS, getDifficultyLabel } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  index: number;
}

function MetadataSection({ control, index }: Props) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {t('questionBuilder.questionSettings')}
        </Typography>
        <Stack spacing={2}>
          <Controller
            name={`questions.${index}.difficulty`}
            control={control}
            render={({ field }) => (
              <FormControl size="small" fullWidth>
                <InputLabel>{t('questionBuilder.difficulty')}</InputLabel>
                <Select
                  {...field}
                  label={t('questionBuilder.difficulty')}
                  renderValue={(val) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DIFFICULTY_COLORS[val] }} />
                      {getDifficultyLabel(val, t)}
                    </Box>
                  )}
                >
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                    <MenuItem key={d} value={d}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DIFFICULTY_COLORS[d] }} />
                        {getDifficultyLabel(d, t)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name={`questions.${index}.points`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                fullWidth
                label={t('questionBuilder.points')}
                type="number"
                slotProps={{ htmlInput: { min: 1 } }}
              />
            )}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default memo(MetadataSection);