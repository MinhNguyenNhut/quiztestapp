import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import type { SubmissionStatus } from '../../../types/submission';

interface ResultsFilterRowProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  statusFilter: string[];
  onStatusChange: (statuses: string[]) => void;
  sortBy: 'submitted' | 'score' | 'time';
  onSortByChange: (sort: 'submitted' | 'score' | 'time') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

const STATUS_OPTIONS: SubmissionStatus[] = ['submitted', 'expired', 'in_progress'];

/**
 * Compact filter row for the editor results tab: search, status filter, sort.
 */
export function ResultsFilterRow({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: ResultsFilterRowProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
      <TextField
        placeholder="Search by name, email..."
        size="small"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 180 }}
      />

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {STATUS_OPTIONS.map((status) => (
          <Chip
            key={status}
            label={status}
            onClick={() => {
              const next = statusFilter.includes(status)
                ? statusFilter.filter((s) => s !== status)
                : [...statusFilter, status];
              onStatusChange(next);
            }}
            variant={statusFilter.includes(status) ? 'filled' : 'outlined'}
            color={statusFilter.includes(status) ? 'primary' : 'default'}
            size="small"
          />
        ))}
      </Box>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel>Sort by</InputLabel>
        <Select value={sortBy} label="Sort by" onChange={(e) => onSortByChange(e.target.value as any)}>
          <MenuItem value="submitted">Date submitted</MenuItem>
          <MenuItem value="score">Score</MenuItem>
          <MenuItem value="time">Time spent</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant={sortOrder === 'asc' ? 'contained' : 'outlined'}
        size="small"
        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
        sx={{ minWidth: 75 }}
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </Button>
    </Stack>
  );
}
