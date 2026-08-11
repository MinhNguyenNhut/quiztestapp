import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import type { Submission } from '../../types/submission';

interface ResultHeaderProps {
  submission: Submission;
  passed: boolean;
  rankPercentile?: number;
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

export const ResultHeader = ({ submission, passed, rankPercentile }: ResultHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: passed
          ? 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(59,130,246,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(168,85,247,0.06) 100%)',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { md: 'center' } }} spacing={3}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: passed ? 'success.main' : 'error.main',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {passed ? <EmojiEventsIcon sx={{ fontSize: 40 }} /> : <SentimentDissatisfiedIcon sx={{ fontSize: 40 }} />}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap" }} spacing={1.5} useFlexGap>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {passed ? t('common.congratulations') : t('common.betterLuckNextTime')}
              </Typography>
              <Chip
                label={passed ? t('common.passed') : t('common.failed')}
                color={passed ? 'success' : 'error'}
                sx={{ fontWeight: 700 }}
              />
            </Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {passed
                ? t('common.completedSuccessfully')
                : t('common.reviewAndTryAgain')}
            </Typography>
            <Stack direction="row" spacing={3} sx={{ mt: 2, flexWrap: "wrap" }} useFlexGap>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  {t('common.score')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {Math.round((submission.score ?? 0) * 10) / 10}
                </Typography>
              </Stack>
              <Stack>
                <Typography variant="caption" color="text.secondary">
                  {t('common.percentage')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: passed ? 'success.main' : 'error.main' }}>
                  {submission.percentage ?? 0}%
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.5}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.timeUsed')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatDuration(submission.timeSpentSeconds)}
                  </Typography>
                </Stack>
              </Stack>
              {rankPercentile !== undefined && (
                <Stack>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.estimatedRank')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {t('common.topPercent', { percent: 100 - rankPercentile })}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
