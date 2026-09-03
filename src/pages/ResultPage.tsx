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

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (submission || !submissionId) return;

    let cancelled = false;
    setNotFound(false);

    dispatch(fetchSubmission(submissionId))
      .unwrap()
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });

    return () => {
      cancelled = true;
    };
  }, [submissionId, submission, dispatch]);

  useEffect(() => {
    if (!quiz) return;
    if (submission) return;
    if (!notFound) return; // don't redirect while still trying to fetch
    navigate(`/quiz/${quiz.id}/candidate`, { replace: true });
  }, [quiz, submission, notFound, navigate]);

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">
          {t('errors.quizNotFound')}{' '}
          <Button onClick={() => navigate('/')}>{t('common.goHome')}</Button>
        </Alert>
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

  return <ResultView quiz={quiz} submission={submission} />;
}

interface ResultViewProps {
  quiz: Quiz;
  submission: Submission;
}

function ResultView({ quiz, submission }: ResultViewProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const safeAnswers = useMemo(() => submission.answers ?? {}, [submission.answers]);

  const summary = useMemo(
    () => computeScore(quiz, safeAnswers),
    [quiz, safeAnswers]
  );
  const passed = (submission.percentage ?? 0) >= (quiz.passingScore ?? 0);

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

  const rankPercentile = estimateRankPercentile(submission.percentage ?? 0);

  const handleRetry = () => {
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
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <ResultHeader
            submission={submission}
            passed={passed}
            rankPercentile={rankPercentile}
          />
          <StatsBlock
            total={summary.perQuestion.length}
            correct={summary.correct}
            wrong={summary.wrong}
            skipped={summary.skipped}
            accuracy={summary.percentage / 100}
            timeUsedSeconds={submission.timeSpentSeconds ?? 0}
          />
          <CandidateSummaryCard
            candidate={submission.candidate}
            fieldsConfig={
              quiz.candidateFieldsConfig ?? getDefaultCandidateFieldsConfig(i18n.language)
            }
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ScoreCircle
                percentage={submission.percentage ?? 0}
                passed={passed}
                score={submission.score ?? 0}
                total={summary.totalPoints}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <PerformanceRadar
                difficulty={difficulties}
                topic={topics}
                accuracyOverall={stats.accuracy}
                participation={participation}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <BreakdownChart title={t('result.byDifficulty')} stats={difficulties} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 12 }}>
              <BreakdownChart title={t('result.byTopic')} stats={topics} />
            </Grid>
          </Grid>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <QuestionReviewAccordion
                results={summary.perQuestion}
                candidateAnswers={safeAnswers}
              />
            </CardContent>
          </Card>

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
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={handleRetry}
                  >
                    {t('result.retryQuiz')}
                  </Button>
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
