import { Box, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ProgressCardProps {
  answered: number;
  total: number;
  flagged: number;
  remaining: number;
}

export const ProgressCard = ({ answered, total, flagged, remaining }: ProgressCardProps) => {
  const { t } = useTranslation();
  const pct = total === 0 ? 0 : Math.round((answered / total) * 100);
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
          <CheckCircleIcon fontSize="small" color="primary" />
          <Typography variant="overline" sx={{ fontWeight: 600 }}>
            {t('examUi.progress')}
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {answered}
          <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.7em', fontWeight: 500 }}>
            {' '}{t('examUi.answeredOf', { total })}
          </Box>
        </Typography>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
        />
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
          <Typography variant="caption" color="text.secondary">
            {t('examUi.percentComplete', { percent: pct })}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
              {t('examUi.flaggedCount', { count: flagged })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('examUi.leftCount', { count: remaining })}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
