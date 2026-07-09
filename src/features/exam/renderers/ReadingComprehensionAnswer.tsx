import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useAppDispatch, useAppSelector } from '../../quiz/store';
import { getExamSession, setAnswer } from '../examSlice';
import type { Question } from '../../../types/quiz';
import { AnswerRenderer } from './AnswerRenderer';

interface Props {
  question: Question;
}

export const ReadingComprehensionAnswer = ({ question }: Props) => {
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const answer = session.answers[question.id];
  const childAnswers: Record<string, import('../../../types/answer').AnyAnswer> =
    answer?.type === 'reading_comprehension' ? answer.childAnswers : {};
  const childQuestions = question.childQuestions ?? [];

  const updateChild = (childId: string, value: import('../../../types/answer').AnyAnswer) => {
    if (value === null) {
      const next = { ...childAnswers };
      delete next[childId];
      dispatch(
        setAnswer({
          questionId: question.id,
          value: { type: 'reading_comprehension', childAnswers: next },
        }),
      );
      return;
    }
    dispatch(
      setAnswer({
        questionId: question.id,
        value: {
          type: 'reading_comprehension',
          childAnswers: { ...childAnswers, [childId]: value },
        },
      }),
    );
  };

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
              Reading passage
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
          No sub-questions configured.
        </Typography>
      ) : (
        childQuestions.map((child, i) => (
          <Accordion key={child.id} defaultExpanded={i === 0} disableGutters sx={{ mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>
                Question {i + 1}: {child.title || 'Sub-question'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Divider sx={{ mb: 2 }} />
              <ChildProxy question={child} value={childAnswers[child.id] ?? null} onChange={(v) => updateChild(child.id, v)} />
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

/**
 * ChildProxy — wraps a sub-question in a thin context so AnswerRenderer
 * can write to the parent's `childAnswers` map instead of the top-level
 * exam slice. Done by mounting a private RHF-less shim: the AnswerRenderer
 * for the child uses the same Redux store but with the child's id as
 * the questionId. To keep things simple, we re-render the renderer with
 * a different questionId by remapping.
 */
import { useEffect, useMemo } from 'react';
import type { AnyAnswer } from '../../../types';

interface ProxyProps {
  question: Question;
  value: AnyAnswer;
  onChange: (v: AnyAnswer) => void;
}

const ChildProxy = ({ question, value, onChange }: ProxyProps) => {
  // Intercept dispatches: we want setAnswer(childId, …) to call
  // onChange instead of writing the global answers map. Easiest path:
  // temporarily rewrite the slice via a one-shot effect. We use a
  // dedicated slice-less store subscription here.

  useEffect(() => {
    // no-op — kept for parity / future analytics
  }, [question.id]);

  // Use a small wrapper that dispatches setAnswer on the *child* id and
  // the parent listens, propagating into childAnswers.
  const remapped = useMemo(() => {
    // Replace the question's id with the child id so AnswerRenderer
    // writes against `answers[child.id]`. The parent then maps that
    // back into childAnswers[child.id].
    return { ...question, id: question.id };
  }, [question]);

  // We avoid dispatching globally: instead, the parent's onChange is
  // bound to the child's onChange by intercepting the AnswerRenderer
  // through a context. For simplicity, we render the renderer inside
  // a child that subscribes to the parent state and overrides the
  // dispatch path. Implementation below:
  return <RemappedAnswerRenderer question={remapped} value={value} onChange={onChange} />;
};

interface RemappedProps {
  question: Question;
  value: AnyAnswer;
  onChange: (v: AnyAnswer) => void;
}

const RemappedAnswerRenderer = ({ question, value, onChange }: RemappedProps) => {
  // Build a tiny standalone store: re-use the global answers map but
  // mirror setAnswer dispatches into onChange.
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const stored = session.answers[question.id] ?? null;

  // We do NOT write to the global store; we only read and call onChange.
  useEffect(() => {
    if (stored && stored !== value) onChange(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stored]);

  return (
    <Box
      onKeyDownCapture={(e) => {
        // No-op; future: support keyboard submit for child answers.
        void e;
      }}
    >
      <AnswerRendererForChild question={question} value={value} onChange={onChange} dispatch={dispatch} />
    </Box>
  );
};

interface RendererProps {
  question: Question;
  value: AnyAnswer;
  onChange: (v: AnyAnswer) => void;
  dispatch: ReturnType<typeof useAppDispatch>;
}

// We re-implement the per-type renderers here (without the global
// dispatch) so changes bubble into the parent's childAnswers map.
const AnswerRendererForChild = ({ question, value, onChange, dispatch: _dispatch }: RendererProps) => {
  void _dispatch; // explicitly unused in this branch
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
              {v ? 'True' : 'False'}
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
