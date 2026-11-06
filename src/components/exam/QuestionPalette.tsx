import { memo, useCallback } from 'react';
import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PaletteCell } from './PaletteCell';
import { useAppSelector } from '../../features/store';

export type PaletteStatus = 'unanswered' | 'current' | 'answered' | 'flagged' | 'required_unanswered';

interface QuestionPaletteProps {
  total: number;
  currentIndex: number;
  flags: string[];
  questions: { id: string; title: string }[];
  onJump: (index: number) => void;
}

export const QuestionPalette = memo(({
  total,
  currentIndex,
  flags,
  questions,
  onJump,
}: QuestionPaletteProps) => {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Stack direction="row" sx={{ mb: 1.5, alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="overline" sx={{ fontWeight: 600 }}>
            {t('examUi.questionPalette')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('examUi.questionCount', { count: total })}
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
            gap: 1,
            mb: 2,
          }}
        >
          {questions.map((q, i) => {
            return (
              <QuestionPaletteCell
                key={q.id}
                question={q}
                index={i}
                isFlagged={flags.includes(q.id)}
                isCurrent={i === currentIndex}
                onJump={onJump}
              />
            );
          })}
        </Box>
        <Legend />
      </CardContent>
    </Card>
  );
});

interface QuestionPaletteCellProps {
  question: { id: string; title: string };
  index: number;
  isFlagged: boolean;
  isCurrent: boolean;
  onJump: (index: number) => void;
}

const QuestionPaletteCell = memo(({
  question,
  index,
  isFlagged,
  isCurrent,
  onJump,
}: QuestionPaletteCellProps) => {
  const { t } = useTranslation();
  const answered = useAppSelector((state) => Boolean(state.exam.answeredQuestions[question.id]));
  const status: PaletteStatus = isCurrent
    ? 'current'
    : isFlagged && !answered
      ? 'flagged'
      : answered
        ? 'answered'
        : 'unanswered';
  const tooltip = t('examUi.questionShort', {
    number: index + 1,
    title: question.title || t('examUi.untitledQuestion'),
  });
  const handleClick = useCallback(() => onJump(index), [onJump, index]);

  return (
    <PaletteCell
      index={index}
      status={status}
      tooltip={tooltip}
      flagged={isFlagged}
      isCurrent={isCurrent}
      onClick={handleClick}
    />
  );
});

const Legend = () => {
  const { t } = useTranslation();
  return (
    <Stack spacing={0.75}>
      <LegendRow color="#e2e8f0" label={t('examUi.legend.unanswered')} border />
      <LegendRow color="#3b82f6" label={t('examUi.legend.current')} />
      <LegendRow color="#22c55e" label={t('examUi.legend.answered')} />
      <LegendRow color="#f97316" label={t('examUi.legend.flagged')} />
      <LegendRow color="#ef4444" label={t('examUi.legend.requiredUnanswered')} />
    </Stack>
  );
};

const LegendRow = ({ color, label, border }: { color: string; label: string; border?: boolean }) => (
  <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
    <Box
      sx={{
        width: 14,
        height: 14,
        borderRadius: 0.5,
        backgroundColor: color,
        border: border ? '1px solid #cbd5e1' : 'none',
        flexShrink: 0,
      }}
    />
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Stack>
);
