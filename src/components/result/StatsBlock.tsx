import { Box, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { StatCard } from '../../shared/components/StatCard';

interface StatsBlockProps {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number; // 0..1
  timeUsedSeconds: number;
}

const formatTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  if (m === 0) return `${sec}s`;
  return `${m}m ${sec}s`;
};

export const StatsBlock = ({ total, correct, wrong, skipped, accuracy, timeUsedSeconds }: StatsBlockProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: "wrap" }} useFlexGap>
      <Box sx={{ flex: '1 1 140px' }}>
        <StatCard label={t('common.total')} value={total} icon={<QuizIcon />} />
      </Box>
      <Box sx={{ flex: '1 1 140px' }}>
        <StatCard label={t('common.correct')} value={correct} icon={<CheckCircleIcon />} color="#22c55e" />
      </Box>
      <Box sx={{ flex: '1 1 140px' }}>
        <StatCard label={t('common.wrong')} value={wrong} icon={<CancelIcon />} color="#ef4444" />
      </Box>
      <Box sx={{ flex: '1 1 140px' }}>
        <StatCard label={t('common.skipped')} value={skipped} icon={<HelpIcon />} color="#94a3b8" />
      </Box>
      <Box sx={{ flex: '1 1 140px' }}>
        <StatCard
          label={t('common.accuracy')}
          value={`${Math.round(accuracy * 100)}%`}
          icon={<CheckCircleIcon />}
          color="#6366f1"
        />
      </Box>
      <Box sx={{ flex: '1 1 140px' }}>
        <StatCard label={t('common.timeUsed')} value={formatTime(timeUsedSeconds)} icon={<AccessTimeIcon />} />
      </Box>
    </Stack>
  );
};
