/**
 * Route component for /quiz/:id/result/:submissionId.
 *
 * Looks up the quiz and submission from Redux, guards against a
 * missing quiz, missing submission, or a submission that belongs to
 * a different quiz (redirects/alert), and renders the result view.
 */
import { useEffect, useMemo, useState } from 'react';
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
import { getQuizzes } from '../features/quiz/quizSlice';
import {
  clearCurrent,
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
import { DEFAULT_CANDIDATE_FIELDS_CONFIG } from '../shared/constants/defaultCandidateFields';
import {
  difficultyBreakdown,
  estimateRankPercentile,
  summaryStats,
  topicBreakdown,
} from '../shared/utils/resultStats';
import type { Quiz, Submission } from '../types';
import { isAnswered } from '../types/answer';

export default function ResultPage() {
  const { id, submissionId } = useParams<{ id: string; submissionId: string }>();
  const navigate = useNavigate();

  const quizzes = useAppSelector(getQuizzes);
  const submissions = useAppSelector(getSubmissionHistory);

  const quiz = useMemo(
    () => quizzes.find((q) => q.id === id) ?? null,
    [quizzes, id]
  );
  const submission = useMemo(
    () => submissions.find((s) => s.id === submissionId) ?? null,
    [submissions, submissionId]
  );

  // If the result URL is valid but we don't have a submission yet (e.g.
  // the page was refreshed and the submission isn't in the store), send
  // the candidate back to start the quiz over.
  useEffect(() => {
    if (!quiz) return;
    if (submission) return;
    navigate(`/quiz/${quiz.id}/candidate`, { replace: true });
  }, [quiz, submission, navigate]);

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">
          Quiz not found.{' '}
          <Button onClick={() => navigate('/')}>Go home</Button>
        </Alert>
      </Box>
    );
  }

  if (!submission) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">Loading result…</Alert>
      </Box>
    );
  }

  if (submission.quizId !== quiz.id) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert
          severity="warning"
          action={<Button onClick={() => navigate('/')}>Home</Button>}
        >
          The result belongs to a different quiz.
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

/**
 * The result UI. Reads submission data, computes the score breakdown,
 * and renders the header, stats, charts, question review, and
 * post-result actions.
 */
function ResultView({ quiz, submission }: ResultViewProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const summary = useMemo(
    () => computeScore(quiz, submission.answers),
    [quiz, submission.answers]
  );
  const passed = (submission.percentage ?? 0) >= (quiz.passingScore ?? 0);

  const stats = useMemo(() => {
    return summaryStats(
      quiz,
      summary.perQuestion,
      submission.answers,
      submission.timeSpentSeconds ?? 0
    );
  }, [quiz, summary, submission.answers, submission.timeSpentSeconds]);

  const topics = useMemo(
    () => topicBreakdown(quiz, summary.perQuestion),
    [quiz, summary.perQuestion]
  );
  const difficulties = useMemo(
    () => difficultyBreakdown(quiz, summary.perQuestion),
    [quiz, summary.perQuestion]
  );

  const participation = useMemo(() => {
    const total = quiz.questions.length;
    if (total === 0) return 0;
    let n = 0;
    for (const q of quiz.questions) {
      if (isAnswered(submission.answers[q.id] ?? null)) n += 1;
    }
    return n / total;
  }, [quiz, submission.answers]);

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
    // Lightweight: trigger the browser's print-to-PDF flow. We avoid
    // pulling a PDF library to keep the bundle small.
    window.print();
  };

  const handleShare = async () => {
    const text = `I scored ${submission.percentage ?? 0}% on "${quiz.title}"!`;
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
        setShareMessage('Result copied to clipboard');
        return;
      } catch {
        // ignore
      }
    }
    setShareMessage('Sharing is not supported in this browser');
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
              quiz.candidateFieldsConfig ?? DEFAULT_CANDIDATE_FIELDS_CONFIG
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
              <BreakdownChart title="By difficulty" stats={difficulties} />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 12 }}>
              <BreakdownChart title="By topic" stats={topics} />
            </Grid>
          </Grid>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <QuestionReviewAccordion
                results={summary.perQuestion}
                candidateAnswers={submission.answers}
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
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ flexWrap: 'wrap' }}
                  useFlexGap
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={handleRetry}
                  >
                    Retry Quiz
                  </Button>
                  <Tooltip title="Download a PDF copy of your result">
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={handleDownloadPdf}
                    >
                      Download PDF
                    </Button>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                  >
                    Print Result
                  </Button>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ flexWrap: 'wrap' }}
                  useFlexGap
                >
                  <Button
                    variant="outlined"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                  >
                    Share Result
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<HomeIcon />}
                    onClick={handleHome}
                  >
                    Return Home
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
