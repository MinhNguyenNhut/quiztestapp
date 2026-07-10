import {
   Box,
   Checkbox,
   Chip,
   IconButton,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TablePagination,
   TableRow,
   Tooltip,
   Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CandidateFieldsConfig } from '../../types/candidate';
import type { Submission, SubmissionStatus } from '../../types/submission';

interface SubmissionsTableProps {
   submissions: Submission[];
   fieldsConfig: CandidateFieldsConfig;
   onRowClick: (submission: Submission) => void;
   onDelete: (submission: Submission) => void;
   selectedIds: Set<string>;
   onToggleSelect: (id: string) => void;
   onToggleSelectAll: (ids: string[], checked: boolean) => void;
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

export function SubmissionsTable({
   submissions,
   fieldsConfig,
   onRowClick,
   onDelete,
   selectedIds,
   onToggleSelect,
   onToggleSelectAll,
   page,
   rowsPerPage,
   totalCount,
   onPageChange,
   onRowsPerPageChange,
}: SubmissionsTableProps) {
   const sortedFields = [...fieldsConfig.fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
   const colCount = sortedFields.length + 6; // checkbox + fields + score + status + time + submitted + actions

   const pageIds = submissions.map((s) => s.id);
   const selectedOnPageCount = pageIds.filter((id) => selectedIds.has(id)).length;
   const allOnPageSelected = pageIds.length > 0 && selectedOnPageCount === pageIds.length;
   const someOnPageSelected = selectedOnPageCount > 0 && !allOnPageSelected;

   return (
      <Box sx={{ mt: 2, width: '100%' }}>
         <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small">
               <TableHead>
                  <TableRow>
                     <TableCell padding="checkbox">
                        <Checkbox
                           checked={allOnPageSelected}
                           indeterminate={someOnPageSelected}
                           onChange={(e) => onToggleSelectAll(pageIds, e.target.checked)}
                           slotProps={{ input: { 'aria-label': 'Select all submissions on this page' } }}
                        />
                     </TableCell>
                     {sortedFields.map((field) => (
                        <TableCell key={field.id} sx={{ fontWeight: 600 }}>
                           {field.label}
                        </TableCell>
                     ))}
                     <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                     <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                     <TableCell sx={{ fontWeight: 600 }}>Time Spent</TableCell>
                     <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                     <TableCell sx={{ fontWeight: 600 }} align="right">
                        Actions
                     </TableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {submissions.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={colCount} align="center" sx={{ py: 4 }}>
                           <Typography variant="body2" color="text.secondary">
                              No submissions found.
                           </Typography>
                        </TableCell>
                     </TableRow>
                  ) : (
                     submissions.map((s) => {
                        const isSelected = selectedIds.has(s.id);
                        return (
                           <TableRow
                              key={s.id}
                              hover
                              selected={isSelected}
                              onClick={() => onRowClick(s)}
                              sx={{ cursor: 'pointer' }}
                           >
                              <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                 <Checkbox
                                    checked={isSelected}
                                    onChange={() => onToggleSelect(s.id)}
                                    slotProps={{ input: { 'aria-label': `Select submission ${s.id}` } }}
                                 />
                              </TableCell>
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
                              <TableCell align="right">
                                 <Tooltip title="Delete submission">
                                    <IconButton
                                       size="small"
                                       color="error"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          onDelete(s);
                                       }}
                                    >
                                       <DeleteIcon fontSize="small" />
                                    </IconButton>
                                 </Tooltip>
                              </TableCell>
                           </TableRow>
                        );
                     })
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
