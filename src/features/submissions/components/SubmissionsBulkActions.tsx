import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../features/quiz/store';
import { deleteSubmission } from '../../../features/exam/submissionSlice';
import DownloadIcon from '@mui/icons-material/Download';
import type { CandidateFieldsConfig } from '../../../types/candidate';
import type { Quiz } from '../../../types/quiz';
import type { Submission } from '../../../types/submission';

interface SubmissionsBulkActionsProps {
  submissions: Submission[];
  fieldsConfig: CandidateFieldsConfig;
  quiz: Quiz;
}

/**
 * Bulk actions: CSV export and optional delete. CSV includes all visible
 * submissions with their candidate fields, score, and metadata.
 */
export function SubmissionsBulkActions({
  submissions,
  fieldsConfig,
  quiz,
}: SubmissionsBulkActionsProps) {
  const dispatch = useAppDispatch();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleExportCSV = () => {
    const sortedFields = [...fieldsConfig.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Build CSV header
    const headers = [
      ...sortedFields.map((f) => f.label),
      'Score',
      'Percentage',
      'Status',
      'Time Spent (seconds)',
      'Submitted At',
    ];

    // Build CSV rows
    const rows = submissions.map((s) => [
      ...sortedFields.map((f) => formatCsvValue(s.candidate[f.id])),
      s.score !== undefined ? String(Math.round(s.score * 10) / 10) : '—',
      String(s.percentage ?? 0),
      s.status,
      String(s.timeSpentSeconds ?? ''),
      s.submittedAt ?? '',
    ]);

    // Combine and download
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((r) => r.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${quiz.title}_submissions.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (submissionId: string) => {
    dispatch(deleteSubmission(submissionId));
    setDeleteTarget(null);
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          disabled={submissions.length === 0}
        >
          Export CSV
        </Button>
      </Stack>

      {/* Delete confirmation dialog (if needed in future) */}
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Submission?</DialogTitle>
        <DialogContent>
          This action cannot be undone. The submission and all its data will be permanently deleted.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteTarget && handleDelete(deleteTarget)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (Array.isArray(value)) return value.join('; ');
  return String(value);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
