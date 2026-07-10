import { Card, CardContent, Stack, Typography, Box, LinearProgress } from '@mui/material';
import type { BreakdownStat } from '../../shared/utils/resultStats';

interface BreakdownChartProps {
  title: string;
  stats: BreakdownStat[];
}

const colorOf = (acc: number): string => {
  if (acc >= 0.8) return '#22c55e';
  if (acc >= 0.5) return '#eab308';
  return '#ef4444';
};

export const BreakdownChart = ({ title, stats }: BreakdownChartProps) => {
  const maxTotal = Math.max(1, ...stats.map((s) => s.total));
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {title}
        </Typography>
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {stats.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No data.
            </Typography>
          )}
          {stats.map((s) => {
            const widthPct = (s.total / maxTotal) * 100;
            const accPct = Math.round(s.accuracy * 100);
            return (
              <Box key={s.key}>
                <Stack direction="row" sx={{ mb: 0.5, alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {s.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {s.correct} / {s.total} · {accPct}%
                  </Typography>
                </Stack>
                <Box sx={{ position: 'relative' }}>
                  <LinearProgress
                    variant="determinate"
                    value={widthPct}
                    sx={{
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: colorOf(s.accuracy),
                        borderRadius: 7,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      right: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 10,
                    }}
                  >
                    {s.total}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};
