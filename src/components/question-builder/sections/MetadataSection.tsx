import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues, Difficulty } from '../../../types/index.ts';
import { DIFFICULTY_COLORS, getDifficultyLabel } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  index: number;
}

export default function MetadataSection({ watch, setValue, index }: Props) {
  const { t } = useTranslation();
  const question = watch(`questions.${index}`);
  const difficulty = question?.difficulty || 'medium';


  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'unset' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          {t('questionBuilder.questionSettings')}
        </Typography>
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('questionBuilder.difficulty')}</InputLabel>
            <Select
              value={difficulty}
              label={t('questionBuilder.difficulty')}
              onChange={(e) =>
                setValue(`questions.${index}.difficulty`, e.target.value as Difficulty, {
                  shouldValidate: true,
                })
              }
              renderValue={(val) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: DIFFICULTY_COLORS[val],
                    }}
                  />
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

          <TextField
            size="small"
            fullWidth
            label={t('questionBuilder.points')}
            type="number"
            value={question?.points || 1}
            onChange={(e) =>
              setValue(`questions.${index}.points`, Number(e.target.value), {
                shouldValidate: true,
              })
            }
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
