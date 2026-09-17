import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ShareIcon from '@mui/icons-material/Share';
import HomeIcon from '@mui/icons-material/Home';
import { useAppDispatch, useAppSelector } from '../features/store';
import {
  clearCurrent,
  fetchSubmission,
  getSubmissionHistory,
} from '../features/submissions/submissionSlice';
import { resetSession } from '../features/exam/examSlice';
import { ResultHeader } from '../components/result/ResultHeader';
import { StatsBlock } from '../components/result/StatsBlock';
import { ScoreCircle } from '../components/result/ScoreCircle';
import { BreakdownChart } from '../components/result/BreakdownChart';
import { PerformanceRadar } from '../components/result/PerformanceRadar';
import { QuestionReviewAccordion } from '../components/result/QuestionReviewAccordion';
import { CandidateSummaryCard } from '../components/result/CandidateSummaryCard';
import { computeScore } from '../shared/utils/scoring';
import {
  difficultyBreakdown,
  estimateRankPercentile,
  summaryStats,
  topicBreakdown,
} from '../shared/utils/resultStats';
import type { Quiz, Submission } from '../types';
import { isAnswered } from '../types/answer';
import { getDefaultCandidateFieldsConfig } from '../shared/constants/defaultCandidateFields';
import { fetchQuizById } from '../features/quiz/quizSlice';
import { getUserProfile } from '../features/user/userSlice';

export default function ResultPage() {
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const quizzes = useAppSelector(state => state.quiz.quizzes);
  const submissions = useAppSelector(getSubmissionHistory);

  const quiz = useMemo(
    () => quizzes.find((q) => q.id === id) ?? null,
    [quizzes, id]
  );
  const submission = useMemo(
    () => submissions.find((s) => s.id === submissionId) ?? null,
    [submissions, submissionId]
  );

  // Get current user profile to check if user is the quiz owner
  const userProfile = useAppSelector(getUserProfile);
  const isQuizOwner = useMemo(
    () => Boolean(userProfile && quiz && userProfile.id === quiz.createdBy),
    [userProfile, quiz]
  );

  const [quizLoadFailed, setQuizLoadFailed] = useState(false);
  const [notFoundId, setNotFoundId] = useState<string | null>(null);

  useEffect(() => {
    if (submission || !submissionId) return;

    let cancelled = false;

    dispatch(fetchSubmission(submissionId))
      .unwrap()
      .catch(() => {
        if (!cancelled) setNotFoundId(submissionId);
      });

    return () => {
      cancelled = true;
    };
  }, [submissionId, submission, dispatch]);

  useEffect(() => {
    if (!quiz) return;
    if (submission) return;
    if (notFoundId !== submissionId) return; // hasn't failed for *this* id
    navigate(`/quiz/${quiz.id}/candidate`, { replace: true });
  }, [quiz, submission, notFoundId, submissionId, navigate]);

  useEffect(() => {
    if (!id) return;
    const existing = quizzes.find((q) => q.id === id);
    if (existing && Array.isArray(existing.questions) && existing.questions.length > 0) return;

    dispatch(fetchQuizById(id))
      .unwrap()
      .catch(() => setQuizLoadFailed(true));
  }, [id, quizzes, dispatch]);


  if (quizLoadFailed) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">
          {t('errors.quizNotFound')}{' '}
          <Button onClick={() => navigate('/')}>{t('common.goHome')}</Button>
        </Alert>
      </Box>
    );
  }

  if (!quiz || !Array.isArray(quiz.questions)) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">{t('result.loadingResult')}</Alert>
      </Box>
    );
  }

  if (!submission) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">{t('result.loadingResult')}</Alert>
      </Box>
    );
  }

  if (submission.quizId !== quiz.id) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert
          severity="warning"
          action={<Button onClick={() => navigate('/')}>{t('common.home')}</Button>}
        >
          {t('result.differentQuiz')}
        </Alert>
      </Box>
    );
  }

  return <ResultView quiz={quiz} submission={submission} isQuizOwner={isQuizOwner} />;
}

interface ResultViewProps {
  quiz: Quiz;
  submission: Submission;
  isQuizOwner: boolean;
}

function ResultView({ quiz, submission, isQuizOwner }: ResultViewProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  // Get quiz settings
  const settings = quiz.settings;

  // ---------------------------------------------------------------------
  // IMPORTANT: All hooks below must run on every render, in the same
  // order, regardless of which branch eventually returns. That's why
  // every useMemo is grouped here, ABOVE the early "showResultsPage"
  // return below. Never put a hook call after a conditional return.
  // ---------------------------------------------------------------------

  const safeAnswers = useMemo(() => submission.answers ?? {}, [submission.answers]);

  const summary = useMemo(
    () => computeScore(quiz, safeAnswers),
    [quiz, safeAnswers]
  );

  const stats = useMemo(() => {
    return summaryStats(
      quiz,
      summary.perQuestion,
      safeAnswers,
      submission.timeSpentSeconds ?? 0
    );
  }, [quiz, summary, safeAnswers, submission.timeSpentSeconds]);

  const topics = useMemo(
    () => topicBreakdown(quiz, summary.perQuestion),
    [quiz, summary.perQuestion]
  );
  const difficulties = useMemo(
    () => difficultyBreakdown(quiz, summary.perQuestion),
    [quiz, summary.perQuestion]
  );

  const participation = useMemo(() => {
    const total = quiz.questionCount ?? quiz.questions.length ?? 0;
    if (total === 0) return 0;
    let n = 0;
    for (const q of quiz.questions) {
      if (isAnswered(safeAnswers[q.id] ?? null)) n += 1;
    }
    return n / total;
  }, [quiz, safeAnswers]);

  const timeUsedRatio = useMemo(() => {
    if (!quiz.estimatedTime || quiz.estimatedTime <= 0) return 0;
    return Math.min(1, (submission.timeSpentSeconds ?? 0) / quiz.estimatedTime);
  }, [quiz.estimatedTime, submission.timeSpentSeconds]);

  // Plain derived values (not hooks) — fine wherever they sit.
  const passed = (submission.percentage ?? 0) >= (quiz.passingScore ?? 0);
  const rankPercentile = estimateRankPercentile(submission.percentage ?? 0);

  // Check retry settings
  const canRetry = settings?.allowRetry !== false;
  const maxAttempts = settings?.maxAttempts ?? 1;
  // For simplicity, we'll track attempt count from the submission history
  // In a real app, this would come from the backend or be computed from submission history
  const attemptCount = 1; // First attempt by default
  const canRetryNow = canRetry && (maxAttempts === 0 || attemptCount < maxAttempts);

  // If showResultsPage is false, show simple completion screen.
  // Quiz owners can always see the full results regardless of this setting.
  // This early return now happens AFTER all hooks have been called,
  // so hook order stays consistent across renders.
  const isOwnerView = isQuizOwner;
  if (settings && settings.showResultsPage === false && !isOwnerView) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          py: { xs: 2, md: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ maxWidth: 600, mx: 'auto', px: 3, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
            {t('result.thankYou')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('result.quizCompleted')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => {
                dispatch(clearCurrent());
                dispatch(resetSession());
                navigate('/');
              }}
            >
              {t('result.returnHome')}
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  const handleRetry = () => {
    if (!canRetryNow) return;
    dispatch(clearCurrent());
    dispatch(resetSession());
    navigate(`/quiz/${quiz.id}/candidate`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = t('result.shareText', {
      percentage: submission.percentage ?? 0,
      title: quiz.title,
    });
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (
          navigator as Navigator & {
            share: (data: { title: string; text: string }) => Promise<void>;
          }
        ).share({
          title: quiz.title,
          text,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setShareMessage(t('result.shareCopied'));
        return;
      } catch {
        // ignore
      }
    }
    setShareMessage(t('result.shareUnsupported'));
  };

  const handleHome = () => {
    dispatch(clearCurrent());
    dispatch(resetSession());
    navigate('/');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ mx: 'auto', px: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          {isQuizOwner || settings?.showPassFailStatus !== false ? (
            <ResultHeader
              submission={submission}
              passed={passed}
              rankPercentile={rankPercentile}
            />
          ) : null}
          {isQuizOwner || settings?.showScore !== false ? (
            <StatsBlock
              total={summary.perQuestion.length}
              correct={summary.correct}
              wrong={summary.wrong}
              skipped={summary.skipped}
              accuracy={summary.percentage / 100}
              timeUsedSeconds={submission.timeSpentSeconds ?? 0}
            />
          ) : null}
          <CandidateSummaryCard
            candidate={submission.candidate}
            fieldsConfig={
              quiz.candidateFieldsConfig ?? getDefaultCandidateFieldsConfig(i18n.language)
            }
          />
          {isQuizOwner || settings?.showScore !== false ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ScoreCircle
                  percentage={submission.percentage ?? 0}
                  passed={passed}
                  score={submission.score ?? 0}
                  total={summary.totalPoints}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <PerformanceRadar
                  difficulty={difficulties}
                  topic={topics}
                  accuracyOverall={stats.accuracy}
                  participation={participation}
                  timeUsedRatio={timeUsedRatio}
                />
              </Grid>
            </Grid>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 12 }}>
              <BreakdownChart title={t('result.byTopic')} stats={topics} />
            </Grid>
          </Grid>

          {isQuizOwner || settings?.showCorrectAnswers !== false ? (
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <QuestionReviewAccordion
                  results={summary.perQuestion}
                  candidateAnswers={safeAnswers}
                  showCorrectAnswers={isQuizOwner || !!settings?.showCorrectAnswers}
                  showExplanations={isQuizOwner || !!settings?.showExplanations}
                />
              </CardContent>
            </Card>
          ) : null}

          <Card
            variant="outlined"
            sx={{ borderRadius: 3, '@media print': { display: 'none' } }}
          >
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'stretch',
                  flexWrap: 'wrap',
                }}
                useFlexGap
              >
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
                  {canRetryNow && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RefreshIcon />}
                      onClick={handleRetry}
                    >
                      {t('result.retryQuiz')}
                    </Button>
                  )}
                  <Tooltip title={t('result.downloadPdfTooltip')}>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={handleDownloadPdf}
                    >
                      {t('result.downloadPdf')}
                    </Button>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                  >
                    {t('result.printResult')}
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                  >
                    {t('result.shareResult')}
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<HomeIcon />}
                    onClick={handleHome}
                  >
                    {t('result.returnHome')}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Snackbar
        open={Boolean(shareMessage)}
        autoHideDuration={2500}
        onClose={() => setShareMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={shareMessage ?? ''}
      />
    </Box>
  );
}