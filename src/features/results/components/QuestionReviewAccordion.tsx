import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import PendingIcon from '@mui/icons-material/Pending';
import type { PerQuestionResult } from '../../../shared/utils/scoring';
import { DifficultyChip } from '../../../shared/components/DifficultyChip';
import { PointsBadge } from '../../../shared/components/PointsBadge';
import { QUESTION_TYPE_LABELS } from '../../../types/quiz';

interface QuestionReviewAccordionProps {
  results: PerQuestionResult[];
  candidateAnswers: Record<string, import('../../../types/answer').AnyAnswer>;
}

const statusMeta = (
  isCorrect: boolean,
  isSkipped: boolean,
  ungraded: boolean,
): { color: 'success' | 'error' | 'default' | 'warning'; icon: React.ReactNode; label: string } => {
  if (ungraded) return { color: 'warning', icon: <PendingIcon fontSize="small" />, label: 'Pending review' };
  if (isCorrect) return { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Correct' };
  if (isSkipped) return { color: 'default', icon: <HelpIcon fontSize="small" />, label: 'Skipped' };
  return { color: 'error', icon: <CancelIcon fontSize="small" />, label: 'Incorrect' };
};

const formatAnswer = (question: import('../../../types/quiz').Question, answer: import('../../../types/answer').AnyAnswer): string => {
  if (!answer) return '—';
  switch (answer.type) {
    case 'single_choice': {
      const opt = question.options.find((o) => o.id === answer.optionId);
      return opt?.text ?? '(unknown)';
    }
    case 'multiple_choice': {
      return question.options.filter((o) => answer.optionIds.includes(o.id)).map((o) => o.text).join(', ') || '(none)';
    }
    case 'true_false':
      return answer.value ? 'True' : 'False';
    case 'fill_in_blank': {
      const blanks = question.blanks ?? [];
      return blanks.map((b, i) => `${i + 1}. ${answer.values[b.id] ?? ''}`).join('\n');
    }
    case 'matching': {
      const pairs = question.matchingPairs ?? [];
      return pairs.map((p) => `${p.left} → ${answer.pairs[p.id] ?? '?'}`).join('\n');
    }
    case 'short_answer':
    case 'essay':
      return answer.text;
    case 'reading_comprehension': {
      const childCount = Object.keys(answer.childAnswers).length;
      return `(see ${childCount} sub-question${childCount === 1 ? '' : 's'} below)`;
    }
    default:
      return '—';
  }
};

const formatCorrectAnswer = (question: import('../../../types/quiz').Question): string => {
  switch (question.type) {
    case 'single_choice':
    case 'multiple_choice': {
      const correct = question.options.filter((o) => o.isCorrect).map((o) => o.text);
      return correct.length > 0 ? correct.join(', ') : '—';
    }
    case 'true_false': {
      const correctOpt = question.options.find((o) => o.isCorrect);
      return correctOpt?.text ?? '—';
    }
    case 'fill_in_blank': {
      return (question.blanks ?? []).map((b, i) => `${i + 1}. ${b.correctAnswer ?? '—'}`).join('\n');
    }
    case 'matching': {
      return (question.matchingPairs ?? []).map((p) => `${p.left} → ${p.right}`).join('\n');
    }
    case 'short_answer':
      return question.expectedAnswer ?? '(manual grading)';
    case 'essay':
      return '(manual grading — see rubric)';
    case 'reading_comprehension':
      return '(see sub-questions)';
    default:
      return '—';
  }
};

export const QuestionReviewAccordion = ({ results, candidateAnswers }: QuestionReviewAccordionProps) => {
  if (results.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No questions to review.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
        Question review
      </Typography>
      <Stack spacing={1}>
        {results.map((r, i) => {
          const meta = statusMeta(
            r.result.isCorrect,
            candidateAnswers[r.questionId] === null || candidateAnswers[r.questionId] === undefined,
            r.result.ungraded ?? false,
          );
          const candidateText = formatAnswer(r.question, candidateAnswers[r.questionId] ?? null);
          const correctText = formatCorrectAnswer(r.question);
          return (
            <Accordion
              key={r.questionId}
              disableGutters
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                '&:before': { display: 'none' },
                borderLeftWidth: 4,
                borderLeftColor:
                  meta.color === 'success'
                    ? 'success.main'
                    : meta.color === 'error'
                      ? 'error.main'
                      : meta.color === 'warning'
                        ? 'warning.main'
                        : 'grey.500',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0, alignItems: "center" }}>
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 700, color: 'primary.main', minWidth: 40 }}
                  >
                    Q{i + 1}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                    {r.question.title || 'Untitled question'}
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: "center" }}>
                    <Chip
                      label={meta.label}
                      color={meta.color}
                      size="small"
                      icon={meta.icon as React.ReactElement}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {r.pointsEarned}/{r.pointsPossible} pts
                    </Typography>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" spacing={0.75} useFlexGap sx={{ mb: 1.5, flexWrap: "wrap" }}>
                  <Chip label={QUESTION_TYPE_LABELS[r.question.type]} size="small" variant="outlined" />
                  <DifficultyChip difficulty={r.question.difficulty} />
                  <PointsBadge points={r.pointsPossible} />
                  {r.question.topic && (
                    <Chip label={r.question.topic} size="small" variant="outlined" color="info" />
                  )}
                </Stack>
                {r.question.content.html && (
                  <Box
                    sx={{
                      mb: 2,
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      '& pre': {
                        backgroundColor: '#0f172a',
                        color: '#e2e8f0',
                        p: 1.5,
                        borderRadius: 1,
                        overflowX: 'auto',
                      },
                    }}
                    dangerouslySetInnerHTML={{ __html: r.question.content.html }}
                  />
                )}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Your answer
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        backgroundColor: 'background.default',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.9rem',
                        minHeight: 40,
                      }}
                    >
                      {candidateText || <em>(no answer)</em>}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Correct answer
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'success.light',
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(34,197,94,0.06)',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.9rem',
                        minHeight: 40,
                      }}
                    >
                      {correctText}
                    </Box>
                  </Box>
                </Stack>
                {r.question.explanation && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, backgroundColor: 'rgba(99,102,241,0.06)' }}>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
                      Explanation
                    </Typography>
                    <Box
                      sx={{ mt: 0.5, fontSize: '0.9rem' }}
                      dangerouslySetInnerHTML={{ __html: r.question.explanation.html || r.question.explanation.text }}
                    />
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
};
