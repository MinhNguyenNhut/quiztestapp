import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { Quiz } from '../../../types/quiz';
import type { Submission } from '../../../types/submission';

interface ResultsSummaryStripProps {
  quiz: Quiz;
  submissions: Submission[];
}

/**
 * Quick stats row: total attempts, avg score, pass rate, avg time.
 */
export function ResultsSummaryStrip({ quiz, submissions }: ResultsSummaryStripProps) {
  const totalAttempts = submissions.length;
  const avgPercentage =
    totalAttempts === 0
      ? 0
      : Math.round(
          submissions.reduce((sum, s) => sum + (s.percentage ?? 0), 0) / totalAttempts
        );

  const passed = submissions.filter(
    (s) => (s.percentage ?? 0) >= (quiz.passingScore ?? 0)
  ).length;
  const passRate = totalAttempts === 0 ? 0 : Math.round((passed / totalAttempts) * 100);

  const avgTime = useMemo(() => {
    const withTime = submissions.filter((s) => s.timeSpentSeconds);
    if (withTime.length === 0) return 0;
    return Math.round(
      withTime.reduce((sum, s) => sum + (s.timeSpentSeconds ?? 0), 0) /
        withTime.length
    );
  }, [submissions]);

  const StatItem = ({ label, value }: { label: string; value: string | number }) => (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Card sx={{ bgcolor: 'background.default' }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={3}>
          <StatItem label="Total Attempts" value={totalAttempts} />
          <StatItem label="Avg. Score" value={`${avgPercentage}%`} />
          <StatItem label="Pass Rate" value={`${passRate}%`} />
          <StatItem label="Avg. Time" value={formatSeconds(avgTime)} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatSeconds(seconds: number): string {
  if (seconds === 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
