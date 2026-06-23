import { useState, useCallback, type KeyboardEvent } from 'react';
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
  Chip,
  Stack,
} from '@mui/material';
import type { Control, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { QuizFormValues, Difficulty } from '../../../types/index.ts';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../../../types/index.ts';

interface Props {
  control: Control<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
  index: number;
}

export default function MetadataSection({ watch, setValue, index }: Props) {
  const question = watch(`questions.${index}`);
  const [tagInput, setTagInput] = useState('');

  const tags = question?.tags || [];
  const difficulty = question?.difficulty || 'medium';

  const handleAddTag = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        const newTags = [...tags, tagInput.trim()];
        setValue(`questions.${index}.tags`, newTags, { shouldValidate: false });
        setTagInput('');
      }
    },
    [tagInput, tags, setValue, index],
  );

  const handleDeleteTag = useCallback(
    (tagIdx: number) => {
      const updated = tags.filter((_: string, i: number) => i !== tagIdx);
      setValue(`questions.${index}.tags`, updated, { shouldValidate: false });
    },
    [tags, setValue, index],
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Question Settings
        </Typography>
        <Stack spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              label="Difficulty"
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
                  {DIFFICULTY_LABELS[val]}
                </Box>
              )}
            >
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <MenuItem key={d} value={d}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DIFFICULTY_COLORS[d] }} />
                    {DIFFICULTY_LABELS[d]}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            fullWidth
            label="Points"
            type="number"
            value={question?.points || 1}
            onChange={(e) =>
              setValue(`questions.${index}.points`, Number(e.target.value), {
                shouldValidate: true,
              })
            }
            inputProps={{ min: 1 }}
          />

          <TextField
            size="small"
            fullWidth
            label="Topic"
            placeholder="e.g., Algebra, Grammar, History"
            value={question?.topic || ''}
            onChange={(e) =>
              setValue(`questions.${index}.topic`, e.target.value, { shouldValidate: false })
            }
          />

          <Box>
            <TextField
              size="small"
              fullWidth
              label="Tags"
              placeholder="Type and press Enter to add"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {tags.map((tag, i) => (
                  <Chip
                    key={i}
                    label={tag}
                    size="small"
                    onDelete={() => handleDeleteTag(i)}
                    sx={{ borderRadius: '4px' }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <TextField
            size="small"
            fullWidth
            label="Estimated Time"
            type="number"
            placeholder="Minutes"
            value={question?.estimatedTime || ''}
            onChange={(e) =>
              setValue(`questions.${index}.estimatedTime`, Number(e.target.value), {
                shouldValidate: false,
              })
            }
            slotProps={{
              input: {
                endAdornment: (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    min
                  </Typography>
                ),
              },
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
