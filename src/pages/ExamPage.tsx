import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Grid,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { store, useAppDispatch, useAppSelector } from '../features/store';
import { isQuizUnlimitedTime } from '../types/quiz';
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
import { createSubmission } from '../features/submissions/submissionSlice';
import type { Quiz, Submission } from '../types';
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

  const quizzes = useAppSelector(state => state.quiz.quizzes);
  const sessionQuizId = useAppSelector((state) => state.exam.quizId);
  const sessionCandidate = useAppSelector((state) => state.exam.candidate);
  const sessionStartedAt = useAppSelector((state) => state.exam.startedAt);
  const submissionId = useAppSelector((state) => state.submission.current?.id ?? null);
  const submissionQuizId = useAppSelector((state) => state.submission.current?.quizId ?? null);

  const quiz: Quiz | null = useMemo(
    () => quizzes.find((q) => q.id === id) ?? null,
    [quizzes, id]
  );

  const submissionRequestedRef = useRef(false);

  useEffect(() => {
    if (!quiz) return;
    if (sessionQuizId !== quiz.id) return;
    if (submissionId && submissionQuizId === quiz.id) return;
    if (submissionRequestedRef.current) return;

    submissionRequestedRef.current = true;
    void dispatch(
      createSubmission({
        quizId: sessionQuizId,
        candidate: (sessionCandidate ?? {}) as Submission['candidate'],
      }),
    );
  }, [dispatch, quiz, sessionQuizId, sessionCandidate, submissionId, submissionQuizId]);

  useEffect(() => {
    if (!quiz) return;
    if (sessionQuizId === quiz.id) return;
    navigate(`/quiz/${quiz.id}/candidate`, { replace: true });
  }, [quiz, sessionQuizId, navigate]);

  const finalizeSubmission = useCallback(
    async (statusOverride?: Submission['status']) => {
      void statusOverride;
      if (!quiz) return;
      if (!sessionStartedAt || !sessionQuizId) return;
      if (!submissionId || submissionQuizId !== quiz.id) {
        return;
      }

      // Mark the session submitted locally; the exam listener middleware
      // hears `submitSession` and POSTs submit, then records the result.
      dispatch(submitSession());
      navigate(`/quiz/${quiz.id}/result/${submissionId}`, { replace: true });
    },
    [dispatch, navigate, quiz, sessionStartedAt, sessionQuizId, submissionId, submissionQuizId]
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

  if (sessionQuizId !== quiz.id) {
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
  const currentIndex = useAppSelector((state) => state.exam.currentIndex);
  const answeredCount = useAppSelector((state) => state.exam.answeredCount);
  const flags = useAppSelector((state) => state.exam.flags);
  const remainingSeconds = useAppSelector((state) => state.exam.remainingSeconds);
  const isSubmitted = useAppSelector((state) => state.exam.isSubmitted);
  const quizId = useAppSelector((state) => state.exam.quizId);
  const candidate = useAppSelector((state) => state.exam.candidate);
  const autoSaveStatus = useAppSelector((state) => state.exam.autoSaveStatus);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fullscreen = useFullscreen();
  const online = useNetworkStatus();

  // Get quiz settings
  const settings = quiz.settings;

  const question = useMemo(
    () => quiz.questions[currentIndex] ?? null,
    [quiz.questions, currentIndex]
  );

  const remaining = quiz.questions.length - answeredCount;

  const hasAnswer = useAppSelector((state) =>
    question ? Boolean(state.exam.answeredQuestions[question.id]) : false
  );
  const isCurrentFlagged = question ? flags.includes(question.id) : false;

  // Check if unlimited time is enabled
  const isUnlimitedTime = isQuizUnlimitedTime(quiz);

  useEffect(() => {
    // If unlimited time is enabled, don't start the timer
    if (isUnlimitedTime) return;
    if (isSubmitted) return;
    if (remainingSeconds <= 0) return;
    const id = window.setInterval(() => {
      dispatch(tickTimer(Math.max(0, remainingSeconds - 1)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [dispatch, remainingSeconds, isSubmitted, isUnlimitedTime]);

  useEffect(() => {
    // If unlimited time is enabled, don't expire the timer
    if (isUnlimitedTime) return;
    if (isSubmitted) return;
    if (remainingSeconds > 0) return;
    dispatch(expireTimer());
    onSubmit('expired');
  }, [dispatch, remainingSeconds, isSubmitted, onSubmit, isUnlimitedTime]);

  const questionSummaries = useMemo(
    () => quiz.questions.map(({ id, title }) => ({ id, title })),
    [quiz.questions]
  );

  const handleNext = useCallback(() => {
    dispatch(nextQuestion());
  }, [dispatch]);

  const handlePrevious = useCallback(() => {
    // Check if backward navigation is allowed
    if (settings?.allowBackwardNavigation === false) {
      return;
    }
    dispatch(previousQuestion());
  }, [dispatch, settings]);

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
      const session = getExamSession(store.getState());
      dispatch(setAutoSaveStatus('saving'));
      sessionStorage.setItem(
        AUTOSAVE_KEY_PREFIX + (session.quizId ?? ''),
        JSON.stringify({ ...session, autoSaveStatus: 'idle' })
      );
      dispatch(setAutoSaveStatus('saved'));
    } catch {
      dispatch(setAutoSaveStatus('error'));
    }
  }, [dispatch]);

  const handleBack = useCallback(() => {
    if (isSubmitted) {
      navigate('/');
      return;
    }
    if (window.confirm(t('exam.goBackConfirm'))) {
      navigate(`/quiz/${quizId}/candidate`);
    }
  }, [navigate, quizId, isSubmitted, t]);

  const handleRetry = useCallback(() => {
    dispatch(resetSession());
    navigate(`/quiz/${quizId}/candidate`);
  }, [dispatch, navigate, quizId]);

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

  const unanswered = quiz.questions.length - answeredCount;
  const candidateName =
    typeof candidate?.firstname === 'string'
      ? `${candidate.firstname} ${candidate.lastname ?? ''}`.trim()
      : t('exam.candidateFallback');

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <ExamSessionAutoSave />
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
        autoSaveStatus={autoSaveStatus}
        online={online}
        trailing={
          !isUnlimitedTime && !isMobile ? (
            <HeaderTimer remainingSeconds={remainingSeconds} />
          ) : undefined
        }
      />

      {!isUnlimitedTime && isMobile && (
        <Box sx={{ p: 2, flexShrink: 0 }}>
          <TimerCard remainingSeconds={remainingSeconds} dense />
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          mx: 'auto',
          width: '100%',
          p: { xs: 1.5, md: 3 },
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={2} sx={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
          {!isMobile && (
            <Grid size={{ xs: 12, md: 4, lg: 3.5 }} sx={{ minHeight: 0, overflow: 'hidden' }}>
              <Box sx={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
                <ExamSidebar>
                  <CandidateMiniCard
                    name={candidateName}
                    email={
                      typeof candidate?.email === 'string'
                        ? candidate.email
                        : undefined
                    }
                    score={answeredCount}
                    total={quiz.questions.length}
                    timeLeftSeconds={isUnlimitedTime ? 0 : remainingSeconds}
                  />
                  {!isUnlimitedTime && (
                    <TimerCard remainingSeconds={remainingSeconds} />
                  )}
                  <ProgressCard
                    answered={answeredCount}
                    total={quiz.questions.length}
                    flagged={flags.length}
                    remaining={remaining}
                  />
                  <QuestionPalette
                    total={quiz.questions.length}
                    currentIndex={currentIndex}
                    flags={flags}
                    questions={questionSummaries}
                    onJump={handleJump}
                  />
                </ExamSidebar>
              </Box>
            </Grid>
          )}

          <Grid
            size={{ xs: 12, md: 8, lg: 8.5 }}
            sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <QuestionCard
              question={question}
              index={currentIndex}
              total={quiz.questions.length}
              contentHtml={question.content.html || question.content.text}
            />
            <ExamFooter
              isFirst={currentIndex === 0}
              isLast={currentIndex === quiz.questions.length - 1}
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

function ExamSessionAutoSave() {
  const dispatch = useAppDispatch();
  const session = useAppSelector(getExamSession);
  const key = AUTOSAVE_KEY_PREFIX + (session.quizId ?? '');
  const sessionForSave = useMemo(
    () => ({ ...session, autoSaveStatus: 'idle' as const }),
    [
      session.quizId,
      session.questionIds,
      session.currentIndex,
      session.answers,
      session.answeredQuestions,
      session.answeredCount,
      session.flags,
      session.bookmarks,
      session.startedAt,
      session.durationSeconds,
      session.remainingSeconds,
      session.isFullscreen,
      session.reviewMode,
      session.isSubmitted,
      session.candidate,
    ],
  );

  useAutoSave(key, sessionForSave, {
    onSave: () => {
      try {
        dispatch(setAutoSaveStatus('saving'));
        sessionStorage.setItem(key, JSON.stringify(sessionForSave));
        dispatch(setAutoSaveStatus('saved'));
      } catch {
        dispatch(setAutoSaveStatus('error'));
      }
    },
  });

  return null;
}

const HeaderTimer = ({ remainingSeconds }: { remainingSeconds: number }) => {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return <span>{formatted}</span>;
};
