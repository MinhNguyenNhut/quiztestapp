import { useMemo, useState } from 'react';
import {
   Alert,
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Toolbar,
   Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../features/store';
import { getQuizzes } from '../features/quiz/quizSlice';
import { deleteSubmission, getSubmissionHistory } from '../features/submissions/submissionSlice';
import { DEFAULT_CANDIDATE_FIELDS_CONFIG } from '../shared/constants/defaultCandidateFields';
import { SubmissionsSummaryHeader } from '../components/submissions/SubmissionsSummaryHeader';
import { SubmissionsFilterBar } from '../components/submissions/SubmissionsFilterBar';
import { SubmissionsTable } from '../components/submissions/SubmissionsTable';
import { SubmissionsBulkActions } from '../components/submissions/SubmissionsBulkActions';
import type { Submission } from '../types/submission';

// Distinguish "delete one row" vs "delete selected batch" so the
// confirmation dialog can show the right copy for either case.
type PendingDelete = { kind: 'single'; submission: Submission } | { kind: 'bulk'; ids: string[] };

export default function SubmissionsDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

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

  const filtered = useMemo(() => {
    let result = submissions;

    if (statusFilter.length > 0) {
      result = result.filter((s) => statusFilter.includes(s.status));
    }

    result = result.filter((s) => {
      const pct = s.percentage ?? 0;
      return pct >= scoreRange[0] && pct <= scoreRange[1];
    });

    if (dateRange[0]) {
      const startDate = new Date(dateRange[0]).getTime();
      result = result.filter((s) => {
        const submittedTime = s.submittedAt ? new Date(s.submittedAt).getTime() : 0;
        return !s.submittedAt || submittedTime >= startDate;
      });
    }
    if (dateRange[1]) {
      const endDate = new Date(dateRange[1]).getTime() + 86400000;
      result = result.filter((s) => {
        const submittedTime = s.submittedAt ? new Date(s.submittedAt).getTime() : 0;
        return !s.submittedAt || submittedTime < endDate;
      });
    }

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

  const paged = useMemo(
    () => sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [sorted, page, rowsPerPage]
  );

  // Drop any selected ids that are no longer in the filtered/sorted set
  // (e.g. the user changed a filter after selecting rows).
  const validSelectedIds = useMemo(() => {
    const validIds = new Set(sorted.map((s) => s.id));
    return new Set([...selectedIds].filter((sid) => validIds.has(sid)));
  }, [selectedIds, sorted]);

  const handleRowClick = (submission: Submission) => {
    navigate(`/quiz/${quiz.id}/result/${submission.id}`);
  };

  const handleToggleSelect = (submissionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(submissionId)) {
        next.delete(submissionId);
      } else {
        next.add(submissionId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = (ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((sid) => (checked ? next.add(sid) : next.delete(sid)));
      return next;
    });
  };

  const handleDeleteRequest = (submission: Submission) => {
    setPendingDelete({ kind: 'single', submission });
  };

  const handleBulkDeleteRequest = () => {
    if (validSelectedIds.size === 0) return;
    setPendingDelete({ kind: 'bulk', ids: [...validSelectedIds] });
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;

    const idsToDelete =
      pendingDelete.kind === 'single' ? [pendingDelete.submission.id] : pendingDelete.ids;

    idsToDelete.forEach((sid) => dispatch(deleteSubmission(sid)));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      idsToDelete.forEach((sid) => next.delete(sid));
      return next;
    });

    // Step back a page if this delete would empty the current page.
    const remainingOnPage = paged.filter((s) => !idsToDelete.includes(s.id)).length;
    if (remainingOnPage === 0 && page > 0) {
      setPage(page - 1);
    }

    setPendingDelete(null);
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

      {validSelectedIds.size > 0 && (
        <Toolbar
          disableGutters
          sx={{
            mt: 2,
            px: 2,
            bgcolor: 'action.selected',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {validSelectedIds.size} selected
          </Typography>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDeleteRequest}
          >
            Delete selected
          </Button>
        </Toolbar>
      )}

      <SubmissionsTable
        submissions={paged}
        fieldsConfig={fieldsConfig}
        onRowClick={handleRowClick}
        onDelete={handleDeleteRequest}
        selectedIds={validSelectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={sorted.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
      />

      <Dialog open={!!pendingDelete} onClose={handleCancelDelete}>
        <DialogTitle>
          {pendingDelete?.kind === 'bulk'
            ? `Delete ${pendingDelete.ids.length} submissions?`
            : 'Delete submission?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingDelete?.kind === 'bulk'
              ? `This will permanently remove ${pendingDelete.ids.length} submissions from "${quiz.title}". This action cannot be undone.`
              : `This will permanently remove the submission from "${quiz.title}". This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
