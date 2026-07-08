/**
 * The top-level exam page. Renders the header, sidebar, main question
 * area, and footer. The exam state (current index, answers, flags,
 * bookmarks, timer, auto-save status) lives in Redux; this component is
 * a thin presentation layer.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { Box, Grid, Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../quiz/store';
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
} from './examSlice';
import { recordSubmission } from './submissionSlice';
import { computeScore } from './../../shared/utils/scoring';
import { isAnswered } from '../../types';
import { useFullscreen } from './../../shared/hooks/useFullscreen';
import { useNetworkStatus } from './../../shared/hooks/useNetworkStatus';
import { useKeyboardShortcuts } from './../../shared/hooks/useKeyboardShortcuts';
import { useAutoSave } from './../../shared/hooks/useAutoSave';
import type { Quiz } from './../../types/quiz';
import type { Submission } from './../../types/submission';
import { ExamHeader } from './components/ExamHeader';
import { ExamSidebar } from './components/ExamSidebar';
import { QuestionCard } from './components/QuestionCard';
import { QuestionPalette } from './components/QuestionPalette';
import { ExamFooter } from './components/ExamFooter';
import { TimerCard } from './components/TimerCard';
import { ProgressCard } from './components/ProgressCard';
import { CandidateMiniCard } from './components/CandidateMiniCard';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import { useState } from 'react';

interface ExamPageProps {
  quiz: Quiz;
  onSubmit: (submission: Submission) => void;
}

const AUTOSAVE_KEY_PREFIX = 'exam-session-';

export default function ExamPage({ quiz, onSubmit }: ExamPageProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const session = useAppSelector(getExamSession);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fullscreen = useFullscreen();
  const online = useNetworkStatus();

  const question = useMemo(
    () => quiz.questions[session.currentIndex] ?? null,
    [quiz.questions, session.currentIndex],
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
    // Live score = sum of points for answered + correctly-answered.
    let total = 0;
    for (const q of quiz.questions) {
      const a = session.answers[q.id];
      if (a && isAnswered(a)) total += 1; // 1pt per answered for the live display
    }
    return total;
  }, [quiz.questions, session.answers, question]);

  // -- Timer -----------------------------------------------------------
  useEffect(() => {
    if (session.isSubmitted) return;
    if (session.remainingSeconds <= 0) return;
    const id = window.setInterval(() => {
      dispatch(tickTimer(Math.max(0, session.remainingSeconds - 1)));
    }, 1000);
    return () => window.clearInterval(id);
  }, [dispatch, session.remainingSeconds, session.isSubmitted]);

  // Auto-submit when the timer hits zero.
  useEffect(() => {
    if (session.isSubmitted) return;
    if (session.remainingSeconds > 0) return;
    dispatch(expireTimer());
    finalizeSubmission('expired');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.remainingSeconds, session.isSubmitted]);

  // -- Auto-save --------------------------------------------------------
  useAutoSave(AUTOSAVE_KEY_PREFIX + (session.quizId ?? ''), session, {
    onSave: () => {
      try {
        dispatch(setAutoSaveStatus('saving'));
        sessionStorage.setItem(
          AUTOSAVE_KEY_PREFIX + (session.quizId ?? ''),
          JSON.stringify(session),
        );
        dispatch(setAutoSaveStatus('saved'));
      } catch {
        dispatch(setAutoSaveStatus('error'));
      }
    },
  });

  // -- Submission -------------------------------------------------------
  const finalizeSubmission = (statusOverride?: Submission["status"]) => {
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
      status: statusOverride ?? "submitted",
    };

    onSubmit(submission);
  };

  // -- Handlers ---------------------------------------------------------
  const handleNext = useCallback(() => {
    dispatch(nextQuestion());
  }, [dispatch]);

  const handlePrevious = useCallback(() => {
    dispatch(previousQuestion());
  }, [dispatch]);

  const handleJump = useCallback((index: number) => dispatch(goToQuestion(index)), [dispatch]);

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
    finalizeSubmission();
  }, [finalizeSubmission]);

  const handleSaveNow = useCallback(() => {
    try {
      dispatch(setAutoSaveStatus('saving'));
      sessionStorage.setItem(
        AUTOSAVE_KEY_PREFIX + (session.quizId ?? ''),
        JSON.stringify(session),
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
    if (window.confirm('Going back will keep your answers, but the timer keeps running. Continue?')) {
      navigate(`/quiz/${session.quizId}/candidate`);
    }
  }, [navigate, session.quizId, session.isSubmitted]);

  const handleRetry = useCallback(() => {
    dispatch(resetSession());
    navigate(`/quiz/${session.quizId}/candidate`);
  }, [dispatch, navigate, session.quizId]);

  // -- Keyboard shortcuts ----------------------------------------------
  useKeyboardShortcuts({
    ArrowLeft: () => handlePrevious(),
    ArrowRight: () => handleNext(),
    'Ctrl+Enter': () => handleSubmit(),
    'Cmd+Enter': () => handleSubmit(),
  });

  if (!question) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="warning" action={
          <button onClick={handleRetry}>Start over</button>
        }>
          This quiz has no questions. <button onClick={handleRetry}>Go back</button>
        </Alert>
      </Box>
    );
  }

  const isCurrentFlagged = session.flags.includes(question.id);
  const currentAnswer = session.answers[question.id] ?? null;
  const hasAnswer = isAnswered(currentAnswer);
  const unanswered = quiz.questions.length - answeredCount;

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', backgroundColor: 'background.default', overflow: 'auto' }}>
      <ExamHeader
        quizTitle={quiz.title}
        candidateName={
          typeof session.candidate?.firstname === 'string'
            ? `${session.candidate.firstname} ${session.candidate.lastname ?? ''}`.trim()
            : 'Candidate'
        }
        fullscreen={fullscreen.isFullscreen}
        fullscreenSupported={fullscreen.supported}
        onToggleFullscreen={() => {
          fullscreen.toggle();
          setErrorMessage(null);
        }}
        onBack={handleBack}
        autoSaveStatus={session.autoSaveStatus}
        online={online}
        trailing={isMobile ? undefined : <HeaderTimer remainingSeconds={session.remainingSeconds} />}
      />

      {isMobile && (
        <Box sx={{ p: 2 }}>
          <TimerCard remainingSeconds={session.remainingSeconds} dense />
        </Box>
      )}

      <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1.5, md: 3 }, overflow: 'auto' }}>
        <Grid container spacing={2}>
          {!isMobile && (
            <Grid size={{ xs: 12, md: 4, lg: 3.5 }}>
              <Box sx={{ position: 'sticky', top: 80 }}>
                <ExamSidebar>
                  <CandidateMiniCard
                    name={
                      typeof session.candidate?.firstname === 'string'
                        ? `${session.candidate.firstname} ${session.candidate.lastname ?? ''}`.trim()
                        : 'Candidate'
                    }
                    email={typeof session.candidate?.email === 'string' ? session.candidate.email : undefined}
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
        title="Submit exam?"
        message={
          unanswered > 0
            ? `You still have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. Submit anyway?`
            : 'You have answered every question. Ready to submit?'
        }
        confirmLabel="Submit"
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
  // Tiny inline format to avoid pulling another timer card into the
  // header — the sidebar already has the full timer.
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return <span>{formatted}</span>;
};
