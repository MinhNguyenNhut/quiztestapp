import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@mui/icons-material/Clear';
import type { SubmissionStatus } from '../../types/submission';

interface SubmissionsFilterBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  statusFilter: string[];
  onStatusChange: (statuses: string[]) => void;
  scoreRange: [number, number];
  onScoreRangeChange: (range: [number, number]) => void;
  dateRange: [string, string];
  onDateRangeChange: (range: [string, string]) => void;
  sortBy: 'submitted' | 'score' | 'time';
  onSortByChange: (sort: 'submitted' | 'score' | 'time') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

const STATUS_OPTIONS: SubmissionStatus[] = ['submitted', 'expired', 'in_progress'];

/**
 * Filter and search bar for submissions. Includes text search, status filter,
 * score range, date range, and sort controls.
 */
export function SubmissionsFilterBar({
  searchText,
  onSearchChange,
  statusFilter,
  onStatusChange,
  scoreRange,
  onScoreRangeChange,
  dateRange,
  onDateRangeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: SubmissionsFilterBarProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const hasFilters =
    searchText !== '' ||
    statusFilter.length > 0 ||
    scoreRange[0] !== 0 ||
    scoreRange[1] !== 100 ||
    dateRange[0] !== '' ||
    dateRange[1] !== '';

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusChange([]);
    onScoreRangeChange([0, 100]);
    onDateRangeChange(['', '']);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {/* Search and sort row */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap>
        <TextField
          placeholder={t('common.searchByNameEmail')}
          size="small"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{t('common.sortBy')}</InputLabel>
          <Select value={sortBy} label={t('common.sortBy')} onChange={(e) => onSortByChange(e.target.value as any)}>
            <MenuItem value="submitted">{t('common.dateSubmitted')}</MenuItem>
            <MenuItem value="score">{t('common.score')}</MenuItem>
            <MenuItem value="time">{t('common.timeSpent')}</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant={sortOrder === 'asc' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
          sx={{ minWidth: 80 }}
        >
          {sortOrder === 'asc' ? t('common.ascending') : t('common.descending')}
        </Button>
        <Button size="small" onClick={() => setExpanded(!expanded)} variant="outlined">
          {expanded ? t('common.hideFilters') : t('common.showFilters')}
        </Button>
        {hasFilters && (
          <Button size="small" onClick={handleClearFilters} startIcon={<ClearIcon />}>
            {t('common.clear')}
          </Button>
        )}
      </Stack>

      {/* Expanded filters */}
      {expanded && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          {/* Status filter */}
          <Box>
            <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                />
              ))}
            </Box>
          </Box>

          {/* Score range */}
          <Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label={t('common.minScore')}
                type="number"
                size="small"
                value={scoreRange[0]}
                onChange={(e) => onScoreRangeChange([Number(e.target.value) || 0, scoreRange[1]])}
                slotProps={{ htmlInput: { min: 0, max: 100 } }}
                sx={{ width: 120 }}
              />
              <span>—</span>
              <TextField
                label={t('common.maxScore')}
                type="number"
                size="small"
                value={scoreRange[1]}
                onChange={(e) => onScoreRangeChange([scoreRange[0], Number(e.target.value) || 100])}
                slotProps={{ htmlInput: { min: 0, max: 100 } }}
                sx={{ width: 120 }}
              />
              <span>%</span>
            </Box>
          </Box>

          {/* Date range */}
          <Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label={t('common.from')}
                type="date"
                size="small"
                value={dateRange[0]}
                onChange={(e) => onDateRangeChange([e.target.value, dateRange[1]])}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 140 }}
              />
              <span>—</span>
              <TextField
                label={t('common.to')}
                type="date"
                size="small"
                value={dateRange[1]}
                onChange={(e) => onDateRangeChange([dateRange[0], e.target.value])}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ width: 140 }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
