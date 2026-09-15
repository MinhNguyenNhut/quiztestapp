import { Card, CardContent, Typography, Box, Stack, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { BreakdownStat } from '../../shared/utils/resultStats';

interface PerformanceRadarProps {
  difficulty: BreakdownStat[];
  topic: BreakdownStat[];
  accuracyOverall: number; // 0..1
  participation: number; // 0..1
  timeUsedRatio: number; // 0..1
}

interface MetricRow {
  label: string;
  value: number; // 0..1
  color: string;
}

export const PerformanceRadar = ({ difficulty, topic, accuracyOverall, timeUsedRatio }: PerformanceRadarProps) => {
  const { t } = useTranslation();
  const byDiff = (label: string) =>
    difficulty.find((d) => d.label.toLowerCase() === label)?.accuracy ?? 0;

  const metrics: MetricRow[] = [
    { label: t('difficulty.easy'), value: byDiff('easy'), color: '#22c55e' },
    { label: t('difficulty.medium'), value: byDiff('medium'), color: '#eab308' },
    { label: t('difficulty.hard'), value: byDiff('hard'), color: '#ef4444' },
    { label: t('common.accuracy'), value: accuracyOverall, color: '#6366f1' },
    { label: t('common.timeUsed'), value: timeUsedRatio, color: '#0ea5e9' },
  ];

  const hasTopic = topic.length > 0;

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('common.performanceRadar')}
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {metrics.map((metric) => (
            <Box key={metric.label}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {metric.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: metric.color }}>
                  {Math.round(metric.value * 100)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, metric.value * 100))}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: metric.color,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
        {hasTopic && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            {topic.length} {t('common.topicsCovered')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};