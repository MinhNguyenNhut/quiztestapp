import { useMemo, useState } from 'react';
import { Alert, Box, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../features/quiz/store';
import { getQuizzes } from '../features/quiz/quizSlice';
import { getSubmissionHistory } from '../features/exam/submissionSlice';
import { DEFAULT_CANDIDATE_FIELDS_CONFIG } from '../shared/constants/defaultCandidateFields';
import { SubmissionsSummaryHeader } from './../features/submissions/components/SubmissionsSummaryHeader';
import { SubmissionsFilterBar } from './../features/submissions/components/SubmissionsFilterBar';
import { SubmissionsTable } from './../features/submissions/components/SubmissionsTable';
import { SubmissionsBulkActions } from './../features/submissions/components/SubmissionsBulkActions';
import type { Submission } from '../types/submission';

export default function SubmissionsDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const quizzes = useAppSelector(getQuizzes);
  const allSubmissions = useAppSelector(getSubmissionHistory);

  const quiz = useMemo(() => quizzes.find((q) => q.id === id), [quizzes, id]);
  const submissions = useMemo(
    () => (quiz ? allSubmissions.filter((s) => s.quizId === quiz.id) : []),
    [allSubmissions, quiz]
  );

  const fieldsConfig = quiz?.candidateFieldsConfig ?? DEFAULT_CANDIDATE_FIELDS_CONFIG;

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [sortBy, setSortBy] = useState<'submitted' | 'score' | 'time'>('submitted');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert
          severity="error"
          action={
            <Button onClick={() => navigate('/')}>
              Home
            </Button>
          }
        >
          Quiz not found.
        </Alert>
      </Box>
    );
  }

  // Filter submissions
  const filtered = useMemo(() => {
    let result = submissions;

    // Status filter
    if (statusFilter.length > 0) {
      result = result.filter((s) => statusFilter.includes(s.status));
    }

    // Score range filter
    result = result.filter((s) => {
      const pct = s.percentage ?? 0;
      return pct >= scoreRange[0] && pct <= scoreRange[1];
    });

    // Date range filter
    if (dateRange[0]) {
      const startDate = new Date(dateRange[0]).getTime();
      result = result.filter((s) => {
        const submittedTime = s.submittedAt ? new Date(s.submittedAt).getTime() : 0;
        return !s.submittedAt || submittedTime >= startDate;
      });
    }
    if (dateRange[1]) {
      const endDate = new Date(dateRange[1]).getTime() + 86400000; // End of day
      result = result.filter((s) => {
        const submittedTime = s.submittedAt ? new Date(s.submittedAt).getTime() : 0;
        return !s.submittedAt || submittedTime < endDate;
      });
    }

    // Text search across candidate fields
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter((s) =>
        fieldsConfig.fields.some((field) => {
          const value = String(s.candidate[field.id] ?? '').toLowerCase();
          return value.includes(lowerSearch);
        })
      );
    }

    return result;
  }, [submissions, statusFilter, scoreRange, dateRange, searchText, fieldsConfig]);

  // Sort submissions
  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'submitted') {
        const timeA = new Date(a.submittedAt || a.startedAt).getTime();
        const timeB = new Date(b.submittedAt || b.startedAt).getTime();
        cmp = timeA - timeB;
      } else if (sortBy === 'score') {
        cmp = (a.percentage ?? 0) - (b.percentage ?? 0);
      } else if (sortBy === 'time') {
        cmp = (a.timeSpentSeconds ?? 0) - (b.timeSpentSeconds ?? 0);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortBy, sortOrder]);

  // Paginate
  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [sorted, page, rowsPerPage]
  );

  const handleRowClick = (submission: Submission) => {
    navigate(`/quiz/${quiz.id}/result/${submission.id}`);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: 'auto' }}>
      <SubmissionsSummaryHeader quiz={quiz} submissions={submissions} />

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <SubmissionsFilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          scoreRange={scoreRange}
          onScoreRangeChange={setScoreRange}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <SubmissionsBulkActions
          submissions={sorted}
          fieldsConfig={fieldsConfig}
          quiz={quiz}
        />
      </Box>

      <SubmissionsTable
        submissions={paged}
        fieldsConfig={fieldsConfig}
        onRowClick={handleRowClick}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={sorted.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />
    </Box>
  );
}
