/**
 * Shared presentational primitives used by the candidate-info, exam, and
 * result pages. Keep this folder strictly presentational — no Redux, no
 * react-router, no business logic.
 */

import { Chip } from '@mui/material';
import type { Difficulty } from '../../types/quiz';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../../types/quiz';

interface DifficultyChipProps {
  difficulty: Difficulty;
  size?: 'small' | 'medium';
}

export const DifficultyChip = ({ difficulty, size = 'small' }: DifficultyChipProps) => (
  <Chip
    label={DIFFICULTY_LABELS[difficulty]}
    size={size}
    sx={{
      backgroundColor: DIFFICULTY_COLORS[difficulty],
      color: '#fff',
      fontWeight: 600,
    }}
  />
);
