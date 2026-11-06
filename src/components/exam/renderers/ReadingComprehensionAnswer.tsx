import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useAppDispatch, useAppSelector } from '../../../features/store';
import { setReadingChildAnswer } from '../../../features/exam/examSlice';
import type { AnyAnswer } from '../../../types/answer';
import type { Question } from '../../../types/quiz';
import { AnswerRenderer } from './AnswerRenderer';

interface Props {
  question: Question;
}

export const ReadingComprehensionAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const childQuestions = question.childQuestions ?? [];

  const updateChild = useCallback(
    (childId: string, value: AnyAnswer) => {
      dispatch(setReadingChildAnswer({
        questionId: question.id,
        childQuestionId: childId,
        value,
      }));
    },
    [dispatch, question.id],
  );

  return (
    <Box>
      {question.passage && (
        <Box
          sx={{
            backgroundColor: 'rgba(99,102,241,0.04)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MenuBookIcon fontSize="small" color="primary" />
            <Typography variant="overline" sx={{ fontWeight: 600, color: 'primary.main' }}>
              {t('answer.readingPassage')}
            </Typography>
          </Box>
          <Box
            sx={{
              fontSize: '0.95rem',
              lineHeight: 1.7,
              '& img': { maxWidth: '100%', height: 'auto' },
            }}
            dangerouslySetInnerHTML={{
              __html: question.passage.html || question.passage.text || '',
            }}
          />
        </Box>
      )}

      {childQuestions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('answer.noSubQuestions')}
        </Typography>
      ) : (
        childQuestions.map((child, i) => (
          <Accordion key={child.id} defaultExpanded={i === 0} disableGutters sx={{ mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>
                {t('answer.question')} {i + 1}:{' '}
                {child.title || t('answer.subQuestion')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Divider sx={{ mb: 2 }} />
              <ChildProxy
                parentQuestionId={question.id}
                question={child}
                onUpdate={updateChild}
              />
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

/**
 * ChildProxy reads and updates its nested answer without subscribing the
 * passage and sibling questions to each keystroke.
 */
interface ProxyProps {
  parentQuestionId: string;
  question: Question;
  onUpdate: (childId: string, value: AnyAnswer) => void;
}

const ChildProxy = ({ parentQuestionId, question, onUpdate }: ProxyProps) => {
  const value = useAppSelector((state) => {
    const answer = state.exam.answers[parentQuestionId];
    return answer?.type === 'reading_comprehension'
      ? answer.childAnswers[question.id] ?? null
      : null;
  });
  const onChange = useCallback(
    (nextValue: AnyAnswer) => onUpdate(question.id, nextValue),
    [onUpdate, question.id],
  );

  return <AnswerRendererForChild question={question} value={value} onChange={onChange} />;
};

interface RendererProps {
  question: Question;
  value: AnyAnswer;
  onChange: (v: AnyAnswer) => void;
}

// We re-implement the per-type renderers here (without the global
// dispatch) so changes bubble into the parent's childAnswers map.
const AnswerRendererForChild = ({ question, value, onChange }: RendererProps) => {
  const { t } = useTranslation();
  switch (question.type) {
    case 'single_choice':
      return (
        <Box>
          {question.options.map((opt) => (
            <Box
              key={opt.id}
              role="button"
              tabIndex={0}
              onClick={() => onChange({ type: 'single_choice', optionId: opt.id })}
              sx={{
                p: 1.5,
                m: 0.5,
                border: '1px solid',
                borderColor: value?.type === 'single_choice' && value.optionId === opt.id ? 'primary.main' : 'divider',
                borderRadius: 1.5,
                backgroundColor: value?.type === 'single_choice' && value.optionId === opt.id ? 'rgba(99,102,241,0.06)' : 'background.paper',
                cursor: 'pointer',
              }}
            >
              {opt.text}
            </Box>
          ))}
        </Box>
      );
    case 'multiple_choice':
      return (
        <Box>
          {question.options.map((opt) => {
            const selected =
              value?.type === 'multiple_choice' && value.optionIds.includes(opt.id);
            return (
              <Box
                key={opt.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  const cur = value?.type === 'multiple_choice' ? value.optionIds : [];
                  const next = cur.includes(opt.id) ? cur.filter((id) => id !== opt.id) : [...cur, opt.id];
                  onChange({ type: 'multiple_choice', optionIds: next });
                }}
                sx={{
                  p: 1.5,
                  m: 0.5,
                  border: '1px solid',
                  borderColor: selected ? 'primary.main' : 'divider',
                  borderRadius: 1.5,
                  backgroundColor: selected ? 'rgba(99,102,241,0.06)' : 'background.paper',
                  cursor: 'pointer',
                }}
              >
                {opt.text}
              </Box>
            );
          })}
        </Box>
      );
    case 'true_false':
      return (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {[true, false].map((v) => (
            <Box
              key={String(v)}
              role="button"
              tabIndex={0}
              onClick={() => onChange({ type: 'true_false', value: v })}
              sx={{
                flex: 1,
                p: 1.5,
                textAlign: 'center',
                border: '1px solid',
                borderColor: value?.type === 'true_false' && value.value === v ? 'primary.main' : 'divider',
                borderRadius: 1.5,
                cursor: 'pointer',
              }}
            >
              {v ? t('answer.true') : t('answer.false')}
            </Box>
          ))}
        </Box>
      );
    case 'short_answer':
      return (
        <Box>
          <textarea
            value={value?.type === 'short_answer' ? value.text : ''}
            onChange={(e) => onChange({ type: 'short_answer', text: e.target.value })}
            style={{ width: '100%', minHeight: 60, padding: 8, fontFamily: 'inherit', fontSize: 14, border: '1px solid #cbd5e1', borderRadius: 4 }}
          />
        </Box>
      );
    case 'essay':
      return (
        <Box>
          <textarea
            value={value?.type === 'essay' ? value.text : ''}
            onChange={(e) => onChange({ type: 'essay', text: e.target.value })}
            style={{ width: '100%', minHeight: 160, padding: 8, fontFamily: 'inherit', fontSize: 14, border: '1px solid #cbd5e1', borderRadius: 4 }}
          />
        </Box>
      );
    default:
      return <AnswerRenderer question={question} />;
  }
};
