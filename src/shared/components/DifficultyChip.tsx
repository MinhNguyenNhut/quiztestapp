import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Difficulty } from '../../types/quiz';
import { DIFFICULTY_COLORS, getDifficultyLabel } from '../../types/quiz';

interface DifficultyChipProps {
  difficulty: Difficulty;
  size?: 'small' | 'medium';
}

export const DifficultyChip = ({
  difficulty,
  size = 'small',
}: DifficultyChipProps) => {
  const { t } = useTranslation();

  return (
    <Chip
      label={getDifficultyLabel(difficulty, t)}
      size={size}
      sx={{
        backgroundColor: DIFFICULTY_COLORS[difficulty],
        color: '#fff',
        fontWeight: 600,
      }}
    />
  );
};
