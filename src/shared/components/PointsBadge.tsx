import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StarIcon from '@mui/icons-material/Star';

interface PointsBadgeProps {
  points: number;
  size?: 'small' | 'medium';
}

export const PointsBadge = ({ points, size = 'small' }: PointsBadgeProps) => {
  const { t } = useTranslation();

  return (
    <Chip
      label={`${points} ${points === 1 ? t('common.pointAbbrev') : t('common.pointsAbbrev')}`}
      size={size}
      color="primary"
      variant="outlined"
      icon={<StarIcon />}
      sx={{ fontWeight: 600 }}
    />
  );
};
