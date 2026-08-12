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
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import PendingIcon from '@mui/icons-material/Pending';
import type { PerQuestionResult } from '../../shared/utils/scoring';
import { DifficultyChip } from '../../shared/components/DifficultyChip';
import { PointsBadge } from '../../shared/components/PointsBadge';
import { getQuestionTypeLabel } from '../../types';

interface QuestionReviewAccordionProps {
  results: PerQuestionResult[];
  candidateAnswers: Record<string, import('../../types/answer').AnyAnswer>;
}

const statusMeta = (
  isCorrect: boolean,
  isSkipped: boolean,
  ungraded: boolean,
  t: (key: string, options?: { count?: number }) => string,
): { color: 'success' | 'error' | 'default' | 'warning'; icon: React.ReactNode; label: string } => {
  if (ungraded) return { color: 'warning', icon: <PendingIcon fontSize="small" />, label: t('common.pendingReview') };
  if (isCorrect) return { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: t('common.correct') };
  if (isSkipped) return { color: 'default', icon: <HelpIcon fontSize="small" />, label: t('common.skipped') };
  return { color: 'error', icon: <CancelIcon fontSize="small" />, label: t('common.incorrect') };
};

const formatAnswer = (question: import('../../types/quiz').Question, answer: import('../../types/answer').AnyAnswer, t: (key: string, options?: { count?: number }) => string): string => {
  if (!answer) return '—';
  switch (answer.type) {
    case 'single_choice': {
      const opt = question.options.find((o) => o.id === answer.optionId);
      return opt?.text ?? t('common.unknown');
    }
    case 'multiple_choice': {
      return question.options.filter((o) => answer.optionIds.includes(o.id)).map((o) => o.text).join(', ') || t('common.none');
    }
    case 'true_false':
      return answer.value ? t('common.true') : t('common.false');
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
      return t('common.seeSubQuestions', { count: childCount });
    }
    default:
      return '—';
  }
};

const formatCorrectAnswer = (question: import('../../types/quiz').Question, t: (key: string, options?: { count?: number }) => string): string => {
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
      return question.expectedAnswer ?? t('common.manualGrading');
    case 'essay':
      return t('common.manualGradingRubric');
    case 'reading_comprehension':
      return t('common.seeSubQuestionsOnly');
    default:
      return '—';
  }
};

export const QuestionReviewAccordion = ({ results, candidateAnswers }: QuestionReviewAccordionProps) => {
  const { t } = useTranslation();

  if (results.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('common.noQuestionsToReview')}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
        {t('common.questionReview')}
      </Typography>
      <Stack spacing={1}>
        {results.map((r, i) => {
          const meta = statusMeta(
            r.result.isCorrect,
            candidateAnswers[r.questionId] === null || candidateAnswers[r.questionId] === undefined,
            r.result.ungraded ?? false,
            t,
          );
          const candidateText = formatAnswer(r.question, candidateAnswers[r.questionId] ?? null, t);
          const correctText = formatCorrectAnswer(r.question, t);
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
                    {r.question.title || t('common.untitledQuestion')}
                  </Typography>
                  <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: "center" }}>
                    <Chip
                      label={meta.label}
                      color={meta.color}
                      size="small"
                      icon={meta.icon as React.ReactElement}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {r.pointsEarned}/{r.pointsPossible} {t('common.pointsAbbrev')}
                    </Typography>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 2 }} />
                <Stack direction="row" spacing={0.75} useFlexGap sx={{ mb: 1.5, flexWrap: "wrap" }}>
                  <Chip label={getQuestionTypeLabel(r.question.type, t)} size="small" variant="outlined" />
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
                      {t('common.yourAnswer')}
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
                      {candidateText || <em>{t('common.noAnswer')}</em>}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {t('common.correctAnswer')}
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
                      {t('common.explanation')}
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
