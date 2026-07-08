import { Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface PointsBadgeProps {
  points: number;
  size?: 'small' | 'medium';
}

export const PointsBadge = ({ points, size = 'small' }: PointsBadgeProps) => (
  <Chip
    label={`${points} ${points === 1 ? 'pt' : 'pts'}`}
    size={size}
    color="primary"
    variant="outlined"
    icon={<StarIcon />}
    sx={{ fontWeight: 600 }}
  />
);
