import { Box, Card, CardContent, Stack, Typography, Divider, Chip } from '@mui/material';
import { DifficultyChip } from '../../shared/components/DifficultyChip';
import { PointsBadge } from '../../shared/components/PointsBadge';
import { QUESTION_TYPE_LABELS } from '../../types/quiz';
import type { Question } from '../../types/quiz';
import { AnswerRenderer } from './renderers/AnswerRenderer';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  /** Server-rendered HTML for the question prompt. */
  contentHtml: string;
}

const formatTime = (seconds?: number): string | null => {
  if (!seconds) return null;
  if (seconds < 60) return `~${seconds}s`;
  const m = Math.round(seconds / 60);
  return `~${m} min`;
};

export const QuestionCard = ({ question, index, total, contentHtml }: QuestionCardProps) => {
  const timeLabel = formatTime(question.estimatedTime);
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        animation: 'fadeIn 0.3s ease',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(236,72,153,0.06) 100%)',
          px: 3,
          py: 2,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: { sm: 'center' } }} spacing={1.5}>
          <Typography variant="overline" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Question {index + 1} of {total}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }} useFlexGap>
            <Chip
              label={QUESTION_TYPE_LABELS[question.type]}
              size="small"
              variant="outlined"
            />
            <DifficultyChip difficulty={question.difficulty} />
            <PointsBadge points={question.points} />
            {timeLabel && (
              <Chip
                label={timeLabel}
                size="small"
                variant="outlined"
              />
            )}
            {question.topic && (
              <Chip label={question.topic} size="small" variant="outlined" color="info" />
            )}
          </Stack>
        </Stack>
        {question.title && (
          <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 600 }}>
            {question.title}
          </Typography>
        )}
      </Box>
      <Divider />
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {contentHtml ? (
          <Box
            sx={{
              fontSize: '1rem',
              lineHeight: 1.7,
              color: 'text.primary',
              mb: 2.5,
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
              '& pre': {
                backgroundColor: '#0f172a',
                color: '#e2e8f0',
                p: 2,
                borderRadius: 1,
                overflowX: 'auto',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: '0.9rem',
              },
              '& blockquote': {
                borderLeft: '4px solid',
                borderColor: 'primary.light',
                pl: 2,
                ml: 0,
                color: 'text.secondary',
              },
            }}
            // Content comes from the question author (admin). Trusted source.
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : null}

        {question.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {question.description}
          </Typography>
        )}

        <AnswerRenderer question={question} />
      </CardContent>
    </Card>
  );
};
