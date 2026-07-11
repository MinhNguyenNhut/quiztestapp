import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useExamTimer } from '../../shared/hooks/useExamTimer';

interface TimerCardProps {
  remainingSeconds: number;
  onExpire?: () => void;
  dense?: boolean;
}

const colorMap = {
  normal: { fg: 'text.primary', border: 'divider' },
  warning: { fg: '#eab308', border: '#eab308' },
  critical: { fg: '#ef4444', border: '#ef4444' },
} as const;

export const TimerCard = ({ remainingSeconds, onExpire, dense = false }: TimerCardProps) => {
  const { t } = useTranslation();
  const { formatted, color, pulse } = useExamTimer(remainingSeconds, onExpire);
  const palette = colorMap[color];

  return (
    <Box
      sx={{
        border: '1.5px solid',
        borderColor: palette.border,
        borderRadius: 2,
        px: 2,
        py: dense ? 1 : 1.5,
        textAlign: 'center',
        transition: 'border-color 0.2s ease, color 0.2s ease',
        animation: pulse ? 'pulse 1.2s ease-in-out infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 1 },
          '50%': { transform: 'scale(1.04)', opacity: 0.85 },
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
        {t('examUi.timeLeftLabel')}
      </Typography>
      <Typography
        variant={dense ? 'h5' : 'h3'}
        sx={{
          fontWeight: 700,
          color: palette.fg,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
          mt: 0.5,
        }}
      >
        {formatted}
      </Typography>
    </Box>
  );
};
