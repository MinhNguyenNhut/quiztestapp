/**
 * Route component for /quiz/:id/exam.
 * ... (unchanged doc comment)
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Alert,
  Box,
  Button,
  Grid,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../features/store';
import { getQuizzes } from '../features/quiz/quizSlice';
import {
  clearAnswer,
  expireTimer,
  getExamSession,
  goToQuestion,
  nextQuestion,
  previousQuestion,
  resetSession,
  setAutoSaveStatus,
  submitSession,
  tickTimer,
  toggleFlag,
} from '../features/exam/examSlice';
import { recordSubmission } from '../features/submissions/submissionSlice';
import { computeScore } from '../shared/utils/scoring';
import { isAnswered, type Quiz, type Submission } from '../types';
import { useFullscreen } from '../shared/hooks/useFullscreen';
import { useNetworkStatus } from '../shared/hooks/useNetworkStatus';
import { useKeyboardShortcuts } from '../shared/hooks/useKeyboardShortcuts';
import { useAutoSave } from '../shared/hooks/useAutoSave';
import { ExamHeader } from '../components/exam/ExamHeader';
import { ExamSidebar } from '../components/exam/ExamSidebar';
import { QuestionCard } from '../components/exam/QuestionCard';
import { QuestionPalette } from '../components/exam/QuestionPalette';
import { ExamFooter } from '../components/exam/ExamFooter';
import { TimerCard } from '../components/exam/TimerCard';
import { ProgressCard } from '../components/exam/ProgressCard';
import { CandidateMiniCard } from '../components/exam/CandidateMiniCard';
import ConfirmDialog from '../components/common/ConfirmDialog/ConfirmDialog';

const AUTOSAVE_KEY_PREFIX = 'exam-session-';

export default function ExamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const quizzes = useAppSelector(getQuizzes);
  const session = useAppSelector(getExamSession);

  const quiz: Quiz | null = useMemo(
    () => quizzes.find((q) => q.id === id) ?? null,
    [quizzes, id]
  );

  useEffect(() => {
    if (!quiz) return;
    if (session.quizId === quiz.id) return;
    navigate(`/quiz/${quiz.id}/candidate`, { replace: true });
  }, [quiz, session.quizId, navigate]);

  const finalizeSubmission = useCallback(
    (statusOverride?: Submission['status']) => {
      if (!quiz) return;
      if (!session.startedAt || !session.quizId) return;

      const summary = computeScore(quiz, session.answers);

      const submission: Submission = {
        id: uuidv4(),
        quizId: session.quizId,
        candidate: session.candidate ?? {},
        answers: session.answers,
        flags: session.flags,
        bookmarks: session.bookmarks,
        startedAt: session.startedAt,
        submittedAt: new Date().toISOString(),
        timeSpentSeconds: Math.floor(
          (Date.now() - new Date(session.startedAt).getTime()) / 1000
        ),
        score: summary.score,
        percentage: summary.percentage,
        status: statusOverride ?? 'submitted',
      };

      dispatch(recordSubmission(submission));
      dispatch(submitSession());

      navigate(`/quiz/${submission.quizId}/result/${submission.id}`, {
        replace: true,
      });
    },
    [dispatch, navigate, quiz, session]
  );

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/')}>
              {t('common.goHome')}
            </Button>
          }
        >
          {t('errors.quizNotFound')}
        </Alert>
      </Box>
    );
  }

  if (session.quizId !== quiz.id) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">{t('exam.loadingExam')}</Alert>
      </Box>
    );
  }

  return <ExamView quiz={quiz} onSubmit={finalizeSubmission} />;
}

interface ExamViewProps {
  quiz: Quiz;
  onSubmit: (statusOverride?: Submission['status']) => void;
}

function ExamView({ quiz, onSubmit }: ExamViewProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const session = useAppSelector(getExamSession);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fullscreen = useFullscreen();
  const online = useNetworkStatus();

  const question = useMemo(
    () => quiz.questions[session.currentIndex] ?? null,
    [quiz.questions, session.currentIndex]
  );

  const answeredCount = useMemo(() => {
    let n = 0;
    for (const q of quiz.questions) {
      if (isAnswered(session.answers[q.id] ?? null)) n += 1;
    }
    return n;
  }, [quiz.questions, session.answers]);

  const remaining = quiz.questions.length - answeredCount;

  const liveScore = useMemo(() => {
    if (!question) return 0;
    let total = 0;
    for (const q of quiz.questions) {
      const a = session.answers[q.id];
      if (a && isAnswered(a)) total += 1;
    }
    return total;
  }, [quiz.questions, session.answers, question]);

  useEffect(() => {
    if (session.isSubmitted) return;
    if (session.remainingSeconds <= 0) return;
    const id = window.setInterval(() => {
      dispatch(tickTimer(Math.max(0, session.remainingSeconds - 1)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [dispatch, session.remainingSeconds, session.isSubmitted]);

  useEffect(() => {
    if (session.isSubmitted) return;
    if (session.remainingSeconds > 0) return;
    dispatch(expireTimer());
    onSubmit('expired');
  }, [dispatch, session.remainingSeconds, session.isSubmitted, onSubmit]);

  useAutoSave(AUTOSAVE_KEY_PREFIX + (session.quizId ?? ''), session, {
    onSave: () => {
      try {
        dispatch(setAutoSaveStatus('saving'));
        sessionStorage.setItem(
          AUTOSAVE_KEY_PREFIX + (session.quizId ?? ''),
          JSON.stringify(session)
        );
        dispatch(setAutoSaveStatus('saved'));
      } catch {
        dispatch(setAutoSaveStatus('error'));
      }
    },
  });

  const handleNext = useCallback(() => {
    dispatch(nextQuestion());
  }, [dispatch]);

  const handlePrevious = useCallback(() => {
    dispatch(previousQuestion());
  }, [dispatch]);

  const handleJump = useCallback(
    (index: number) => dispatch(goToQuestion(index)),
    [dispatch]
  );

  const handleToggleFlag = useCallback(() => {
    if (!question) return;
    dispatch(toggleFlag(question.id));
  }, [dispatch, question]);

  const handleClear = useCallback(() => {
    if (!question) return;
    dispatch(clearAnswer(question.id));
  }, [dispatch, question]);

  const handleSubmit = useCallback(() => setConfirmOpen(true), []);
  const handleConfirmSubmit = useCallback(() => {
    setConfirmOpen(false);
    onSubmit();
  }, [onSubmit]);

  const handleSaveNow = useCallback(() => {
    try {
      dispatch(setAutoSaveStatus('saving'));
      sessionStorage.setItem(
        AUTOSAVE_KEY_PREFIX + (session.quizId ?? ''),
        JSON.stringify(session)
      );
      dispatch(setAutoSaveStatus('saved'));
    } catch {
      dispatch(setAutoSaveStatus('error'));
    }
  }, [session, dispatch]);

  const handleBack = useCallback(() => {
    if (session.isSubmitted) {
      navigate('/');
      return;
    }
    if (window.confirm(t('exam.goBackConfirm'))) {
      navigate(`/quiz/${session.quizId}/candidate`);
    }
  }, [navigate, session.quizId, session.isSubmitted, t]);

  const handleRetry = useCallback(() => {
    dispatch(resetSession());
    navigate(`/quiz/${session.quizId}/candidate`);
  }, [dispatch, navigate, session.quizId]);

  useKeyboardShortcuts({
    ArrowLeft: () => handlePrevious(),
    ArrowRight: () => handleNext(),
    'Ctrl+Enter': () => handleSubmit(),
    'Cmd+Enter': () => handleSubmit(),
  });

  if (!question) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert
          severity="warning"
          action={
            <button onClick={handleRetry}>{t('exam.startOver')}</button>
          }
        >
          {t('exam.noQuestionsTitle')}{' '}
          <button onClick={handleRetry}>{t('exam.goBack')}</button>
        </Alert>
      </Box>
    );
  }

  const isCurrentFlagged = session.flags.includes(question.id);
  const currentAnswer = session.answers[question.id] ?? null;
  const hasAnswer = isAnswered(currentAnswer);
  const unanswered = quiz.questions.length - answeredCount;
  const candidateName =
    typeof session.candidate?.firstname === 'string'
      ? `${session.candidate.firstname} ${session.candidate.lastname ?? ''}`.trim()
      : t('exam.candidateFallback');

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        backgroundColor: 'background.default',
        overflow: 'auto',
      }}
    >
      <ExamHeader
        quizTitle={quiz.title}
        candidateName={candidateName}
        fullscreen={fullscreen.isFullscreen}
        fullscreenSupported={fullscreen.supported}
        onToggleFullscreen={() => {
          fullscreen.toggle();
          setErrorMessage(null);
        }}
        onBack={handleBack}
        autoSaveStatus={session.autoSaveStatus}
        online={online}
        trailing={
          isMobile ? undefined : (
            <HeaderTimer remainingSeconds={session.remainingSeconds} />
          )
        }
      />

      {isMobile && (
        <Box sx={{ p: 2 }}>
          <TimerCard remainingSeconds={session.remainingSeconds} dense />
        </Box>
      )}

      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          p: { xs: 1.5, md: 3 },
          overflow: 'auto',
        }}
      >
        <Grid container spacing={2}>
          {!isMobile && (
            <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
              <Box sx={{ position: 'sticky', top: 80 }}>
                <ExamSidebar>
                  <CandidateMiniCard
                    name={candidateName}
                    email={
                      typeof session.candidate?.email === 'string'
                        ? session.candidate.email
                        : undefined
                    }
                    score={liveScore}
                    total={quiz.questions.length}
                    timeLeftSeconds={session.remainingSeconds}
                  />
                  <TimerCard remainingSeconds={session.remainingSeconds} />
                  <ProgressCard
                    answered={answeredCount}
                    total={quiz.questions.length}
                    flagged={session.flags.length}
                    remaining={remaining}
                  />
                  <QuestionPalette
                    total={quiz.questions.length}
                    currentIndex={session.currentIndex}
                    answers={session.answers}
                    flags={session.flags}
                    questions={quiz.questions.map((q) => ({ id: q.id, title: q.title }))}
                    onJump={handleJump}
                  />
                </ExamSidebar>
              </Box>
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 8, lg: 8.5 }}>
            <QuestionCard
              question={question}
              index={session.currentIndex}
              total={quiz.questions.length}
              contentHtml={question.content.html || question.content.text}
            />
            <ExamFooter
              isFirst={session.currentIndex === 0}
              isLast={session.currentIndex === quiz.questions.length - 1}
              isFlagged={isCurrentFlagged}
              hasAnswer={hasAnswer}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onToggleFlag={handleToggleFlag}
              onClear={handleClear}
              onSubmit={handleSubmit}
              onSaveNow={handleSaveNow}
            />
          </Grid>
        </Grid>
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title={t('exam.submitTitle')}
        message={
          unanswered > 0
            ? t('exam.submitUnanswered', { count: unanswered })
            : t('exam.submitAllAnswered')
        }
        confirmLabel={t('common.submit')}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmOpen(false)}
      />

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)} variant="filled">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

const HeaderTimer = ({ remainingSeconds }: { remainingSeconds: number }) => {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return <span>{formatted}</span>;
};
