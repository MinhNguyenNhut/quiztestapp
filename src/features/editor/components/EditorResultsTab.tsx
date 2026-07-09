import { useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../../quiz/store';
import { getSubmissionHistory } from '../../exam/submissionSlice';
import { DEFAULT_CANDIDATE_FIELDS_CONFIG } from '../../../shared/constants/defaultCandidateFields';
import { ResultsSummaryStrip } from './ResultsSummaryStrip';
import { ResultsFilterRow } from './ResultsFilterRow';
import { ResultsList } from './ResultsList';
import { ResultsExportButton } from './ResultsExportButton';
import { ResultDetailDrawer } from './ResultDetailDrawer';
import type { Quiz } from '../../../types/quiz';
import type { Submission } from '../../../types/submission';

interface EditorResultsTabProps {
  quiz: Quiz;
}

/**
 * Results tab inside the quiz editor. Lists all submissions for the quiz
 * with filtering, sorting, search, and an inline detail drawer.
 */
export function EditorResultsTab({ quiz }: EditorResultsTabProps) {
  const allSubmissions = useAppSelector(getSubmissionHistory);
  const fieldsConfig = quiz.candidateFieldsConfig ?? DEFAULT_CANDIDATE_FIELDS_CONFIG;

  const submissions = useMemo(
    () => allSubmissions.filter((s) => s.quizId === quiz.id),
    [allSubmissions, quiz.id]
  );

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'submitted' | 'score' | 'time'>('submitted');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Filter submissions
  const filtered = useMemo(() => {
    let result = submissions;

    if (statusFilter.length > 0) {
      result = result.filter((s) => statusFilter.includes(s.status));
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
  }, [submissions, statusFilter, searchText, fieldsConfig]);

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', p: 2 }}>
      <ResultsSummaryStrip quiz={quiz} submissions={submissions} />

      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <ResultsFilterRow
          searchText={searchText}
          onSearchChange={setSearchText}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <ResultsExportButton submissions={sorted} fieldsConfig={fieldsConfig} quiz={quiz} />
      </Box>

      <Box sx={{ mt: 2, flex: 1, overflow: 'auto' }}>
        <ResultsList
          submissions={sorted}
          fieldsConfig={fieldsConfig}
          onRowClick={setSelectedSubmission}
        />
      </Box>

      <ResultDetailDrawer
        submission={selectedSubmission}
        quiz={quiz}
        open={selectedSubmission !== null}
        onClose={() => setSelectedSubmission(null)}
      />
    </Box>
  );
}
