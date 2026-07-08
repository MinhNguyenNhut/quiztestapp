import { useMemo } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Snackbar, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ShareIcon from '@mui/icons-material/Share';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './../quiz/store';
import { resetSession } from '../exam/examSlice';
import { clearCurrent } from '../exam/submissionSlice';
import { ResultHeader } from './components/ResultHeader';
import { StatsBlock } from './components/StatsBlock';
import { ScoreCircle } from './components/ScoreCircle';
import { BreakdownChart } from './components/BreakdownChart';
import { PerformanceRadar } from './components/PerformanceRadar';
import { QuestionReviewAccordion } from './components/QuestionReviewAccordion';
import { computeScore } from '../../shared/utils/scoring';
import {
  difficultyBreakdown,
  estimateRankPercentile,
  summaryStats,
  topicBreakdown,
} from '../../shared/utils/resultStats';
import type { Quiz } from '../../types/quiz';
import type { Submission } from '../../types/submission';
import { isAnswered } from '../../types/answer';
import { useState } from 'react';

interface ResultPageProps {
  quiz: Quiz;
  submission: Submission;
}

export default function ResultPage({ quiz, submission }: ResultPageProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const summary = useMemo(() => computeScore(quiz, submission.answers), [quiz, submission.answers]);
  const passed = (submission.percentage ?? 0) >= (quiz.passingScore ?? 0);

  const stats = useMemo(() => {
    return summaryStats(quiz, summary.perQuestion, submission.timeSpentSeconds ?? 0);
  }, [quiz, summary, submission.timeSpentSeconds]);

  const topics = useMemo(() => topicBreakdown(quiz, summary.perQuestion), [quiz, summary.perQuestion]);
  const difficulties = useMemo(() => difficultyBreakdown(quiz, summary.perQuestion), [quiz, summary.perQuestion]);

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
        await (navigator as Navigator & { share: (data: { title: string; text: string }) => Promise<void> }).share({
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
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <ResultHeader submission={submission} passed={passed} rankPercentile={rankPercentile} />
          <StatsBlock
            total={stats.total}
            correct={stats.correct}
            wrong={stats.wrong}
            skipped={stats.skipped}
            accuracy={stats.accuracy}
            timeUsedSeconds={submission.timeSpentSeconds ?? 0}
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
              <QuestionReviewAccordion results={summary.perQuestion} candidateAnswers={submission.answers} />
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, '@media print': { display: 'none' } }}>
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: "space-between", alignItems: "stretch", flexWrap: "wrap" }}
                useFlexGap
              >
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }} useFlexGap>
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
                <Stack direction="row" spacing={1.5} sx={{ flexWrap:"wrap" }} useFlexGap>
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
      >
        <Box />
      </Snackbar>
      {/* share message is rendered via a single visible snackbar — we
          keep the snackbar empty above and rely on Alert. */}
      <Snackbar
        open={Boolean(shareMessage)}
        autoHideDuration={2500}
        onClose={() => setShareMessage(null)}
        message={shareMessage ?? ''}
      />
    </Box>
  );
}
