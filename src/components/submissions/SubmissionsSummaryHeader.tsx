import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { Quiz } from '../../types/quiz';
import type { Submission } from '../../types/submission';

interface SubmissionsSummaryHeaderProps {
  quiz: Quiz;
  submissions: Submission[];
}

/**
 * Header summary showing total attempts, average score, pass rate, and average time.
 */
export function SubmissionsSummaryHeader({ quiz, submissions }: SubmissionsSummaryHeaderProps) {
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

  const StatBox = ({
    label,
    value,
    unit,
  }: {
    label: string;
    value: string | number;
    unit?: string;
  }) => (
    <Card sx={{ flex: '1 1 180px', minWidth: 0 }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {unit && (
            <Typography variant="body2" color="text.secondary">
              {unit}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {quiz.title} — Submissions
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
        <StatBox label="Total Attempts" value={totalAttempts} />
        <StatBox label="Avg. Score" value={`${avgPercentage}%`} />
        <StatBox label="Pass Rate" value={`${passRate}%`} />
        <StatBox label="Avg. Time" value={formatSeconds(avgTime)} />
      </Stack>
    </Box>
  );
}

function formatSeconds(seconds: number): string {
  if (seconds === 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
