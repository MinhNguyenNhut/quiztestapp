import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { PaletteCell } from './PaletteCell';
import type { AnyAnswer } from '../../types/answer';
import { isAnswered } from '../../types/answer';

export type PaletteStatus = 'unanswered' | 'current' | 'answered' | 'flagged' | 'required_unanswered';

interface QuestionPaletteProps {
  total: number;
  currentIndex: number;
  answers: Record<string, AnyAnswer>;
  flags: string[];
  questions: { id: string; title: string }[];
  onJump: (index: number) => void;
}

export const QuestionPalette = ({
  total,
  currentIndex,
  answers,
  flags,
  questions,
  onJump,
}: QuestionPaletteProps) => {
  const statusFor = (index: number, id: string): PaletteStatus => {
    if (index === currentIndex) return 'current';
    if (flags.includes(id) && !isAnswered(answers[id] ?? null)) return 'flagged';
    if (isAnswered(answers[id] ?? null)) return 'answered';
    return 'unanswered';
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Stack direction="row" sx={{ mb: 1.5, alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="overline" sx={{ fontWeight: 600 }}>
            Question Palette
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {total} {total === 1 ? 'question' : 'questions'}
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
            const status = statusFor(i, q.id);
            const tooltip = `Q${i + 1}: ${q.title || 'Untitled question'}`;
            return (
              <PaletteCell
                key={q.id}
                index={i}
                status={status}
                tooltip={tooltip}
                flagged={flags.includes(q.id)}
                isCurrent={i === currentIndex}
                onClick={() => onJump(i)}
              />
            );
          })}
        </Box>
        <Legend />
      </CardContent>
    </Card>
  );
};

const Legend = () => (
  <Stack spacing={0.75}>
    <LegendRow color="#e2e8f0" label="Unanswered" border />
    <LegendRow color="#3b82f6" label="Current" />
    <LegendRow color="#22c55e" label="Answered" />
    <LegendRow color="#f97316" label="Flagged" />
    <LegendRow color="#ef4444" label="Required, unanswered" />
  </Stack>
);

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
