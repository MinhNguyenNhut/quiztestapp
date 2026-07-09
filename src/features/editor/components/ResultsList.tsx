import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import type { CandidateFieldsConfig } from '../../../types/candidate';
import type { Submission } from '../../../types/submission';

interface ResultsListProps {
  submissions: Submission[];
  fieldsConfig: CandidateFieldsConfig;
  onRowClick: (submission: Submission) => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return 'success';
    case 'expired':
      return 'warning';
    case 'in_progress':
      return 'info';
    default:
      return 'default';
  }
};

/**
 * Card-based list of submissions for compact editor display.
 * Shows key candidate fields + score/status inline.
 */
export function ResultsList({
  submissions,
  fieldsConfig,
  onRowClick,
}: ResultsListProps) {
  // First 2-3 candidate fields for display (rest in drawer)
  const displayFields = useMemo(
    () => [...fieldsConfig.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 3),
    [fieldsConfig]
  );

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatSeconds = (seconds?: number): string => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  if (submissions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        <Typography variant="body2">No one has taken this quiz yet.</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1}>
      {submissions.map((submission) => (
        <Card
          key={submission.id}
          onClick={() => onRowClick(submission)}
          sx={{
            cursor: 'pointer',
            '&:hover': { boxShadow: 2, bgcolor: 'action.hover' },
            transition: 'all 0.2s',
          }}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              {/* Candidate info */}
              <Box>
                {displayFields.map((field) => (
                  <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
                      {field.label}:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {formatValue(submission.candidate[field.id])}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Score and status */}
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Score
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: (submission.percentage ?? 0) >= 70 ? 'success.main' : 'error.main',
                    }}
                  >
                    {submission.percentage ?? 0}%
                  </Typography>
                </Box>
                <Chip label={submission.status} color={statusColor(submission.status)} size="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    {formatSeconds(submission.timeSpentSeconds)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Submitted
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    {formatDate(submission.submittedAt)}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
