import {
   Box,
   Chip,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TablePagination,
   TableRow,
   Typography,
} from '@mui/material';
import type { CandidateFieldsConfig } from '../../types/candidate';
import type { Submission, SubmissionStatus } from '../../types/submission';

interface SubmissionsTableProps {
   submissions: Submission[];
   fieldsConfig: CandidateFieldsConfig;
   onRowClick: (submission: Submission) => void;
   page: number;
   rowsPerPage: number;
   totalCount: number;
   onPageChange: (page: number) => void;
   onRowsPerPageChange: (rowsPerPage: number) => void;
}

const STATUS_COLOR: Record<SubmissionStatus, 'success' | 'warning' | 'default' | 'info'> = {
   submitted: 'success',
   graded: 'info',
   expired: 'warning',
   in_progress: 'default',
};

/**
 * Paginated table of submissions. Columns are derived from the quiz's
 * candidate fields config, followed by score, status, time spent, and
 * submitted date. Clicking a row navigates to the submission's result page.
 */
export function SubmissionsTable({
   submissions,
   fieldsConfig,
   onRowClick,
   page,
   rowsPerPage,
   totalCount,
   onPageChange,
   onRowsPerPageChange,
}: SubmissionsTableProps) {
   const sortedFields = [...fieldsConfig.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

   return (
      <Box sx={{ mt: 2, width: '100%' }}>
         <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small">
               <TableHead>
                  <TableRow>
                     {sortedFields.map((field) => (
                        <TableCell key={field.id} sx={{ fontWeight: 600 }}>
                           {field.label}
                        </TableCell>
                     ))}
                     <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                     <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                     <TableCell sx={{ fontWeight: 600 }}>Time Spent</TableCell>
                     <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {submissions.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={sortedFields.length + 4} align="center" sx={{ py: 4 }}>
                           <Typography variant="body2" color="text.secondary">
                              No submissions found.
                           </Typography>
                        </TableCell>
                     </TableRow>
                  ) : (
                     submissions.map((s) => (
                        <TableRow
                           key={s.id}
                           hover
                           onClick={() => onRowClick(s)}
                           sx={{ cursor: 'pointer' }}
                        >
                           {sortedFields.map((field) => (
                              <TableCell key={field.id}>
                                 {formatCellValue(s.candidate[field.id])}
                              </TableCell>
                           ))}
                           <TableCell>{formatScore(s)}</TableCell>
                           <TableCell>
                              <Chip
                                 size="small"
                                 label={s.status}
                                 color={STATUS_COLOR[s.status] ?? 'default'}
                                 variant="outlined"
                              />
                           </TableCell>
                           <TableCell>{formatSeconds(s.timeSpentSeconds)}</TableCell>
                           <TableCell>{formatDate(s.submittedAt)}</TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </TableContainer>

         <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
               onRowsPerPageChange(Number(e.target.value));
               onPageChange(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
         />
      </Box>
   );
}

function formatCellValue(value: unknown): string {
   if (value === null || value === undefined || value === '') return '—';
   if (Array.isArray(value)) return value.join(', ');
   return String(value);
}

function formatScore(s: Submission): string {
   if (s.percentage === undefined || s.percentage === null) return '—';
   return `${Math.round(s.percentage)}%`;
}

function formatSeconds(seconds?: number): string {
   if (!seconds) return '—';
   const m = Math.floor(seconds / 60);
   const sec = Math.round(seconds % 60);
   if (m === 0) return `${sec}s`;
   return `${m}m ${sec}s`;
}

function formatDate(dateStr?: string): string {
   if (!dateStr) return '—';
   const d = new Date(dateStr);
   if (isNaN(d.getTime())) return '—';
   return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
}
