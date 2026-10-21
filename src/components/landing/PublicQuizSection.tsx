import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Alert,
  Skeleton,
  Pagination,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import { useAppDispatch, useAppSelector } from '../../features/store.ts';
import { fetchPublicQuizzes, getPublicQuizzes, getPublicIsLoading, getPublicError, getPublicHasMore } from '../../features/quiz/quizSlice.ts';
import { PublicQuizCard } from './PublicQuizCard';

const DEBOUNCE_MS = 300;
const LIMIT = 9;

export default function PublicQuizSection() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const quizzes = useAppSelector(getPublicQuizzes);
  const isLoading = useAppSelector(getPublicIsLoading);
  const error = useAppSelector(getPublicError);
  const hasMore = useAppSelector(getPublicHasMore);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search; reset to page 1 whenever the query actually changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = search.trim().toLowerCase();
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Always fetch, including the initial empty search on page 1
  useEffect(() => {
    void dispatch(fetchPublicQuizzes({ search: debouncedSearch, page, limit: LIMIT }));
  }, [dispatch, debouncedSearch, page]);

  const filtered = useMemo(() => {
    const q = debouncedSearch;
    if (!q) return quizzes;
    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(q) ||
        quiz.description.toLowerCase().includes(q)
    );
  }, [quizzes, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
    document.getElementById('quizzes')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <Box
      component="section"
      id="quizzes"
      sx={{
        py: { xs: 7, md: 10 },
        px: { xs: 2, md: 3 },
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* ── Section header ─────────────────────────────────────────── */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2.5, sm: 3 }}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 5 }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                display: 'block',
                color: 'primary.main',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 2.5,
              }}
            >
              {t('landing.quizzes.label')}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: -1,
              }}
            >
              {t('landing.quizzes.title')}
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder={t('landing.quizzes.searchPlaceholder')}
            value={search}
            onChange={handleSearchChange}
            fullWidth
            sx={{
              width: { sm: 320 },
              flexShrink: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                bgcolor: 'background.paper',
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
                '& fieldset': { borderColor: 'divider' },
                '&:hover fieldset': { borderColor: 'primary.main' },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
            }}
            slotProps={{
              input: {
                sx: { pl: 1.5 },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>

        {/* ── Error state ────────────────────────────────────────────── */}
        {error && (
          <Alert severity="error" variant="filled" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* ── Content ────────────────────────────────────────────────── */}
        {isLoading && filtered.length === 0 ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                  }}
                >
                  <Skeleton variant="rectangular" height={140} />
                  <Box sx={{ p: 2.5 }}>
                    <Skeleton variant="text" width="70%" height={28} />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="45%" />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 ? (
          <Stack
            sx={{
              alignItems: 'center',
              py: { xs: 7, md: 10 },
              px: 3,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 4,
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                display: 'grid',
                placeItems: 'center',
                mb: 2.5,
              }}
            >
              <SearchOffIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              {t('landing.quizzes.emptyTitle')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 380, textAlign: 'center' }}
            >
              {debouncedSearch
                ? t('landing.quizzes.noResults', { search })
                : t('landing.quizzes.emptyDescription')}
            </Typography>
            {debouncedSearch && (
              <Button
                variant="contained"
                disableElevation
                onClick={() => setSearch('')}
                sx={{ borderRadius: 999, textTransform: 'none', px: 3.5, py: 1.1, fontWeight: 700 }}
              >
                {t('landing.quizzes.clearSearch')}
              </Button>
            )}
          </Stack>
        ) : (
          <>
            <Grid container spacing={3}>
              {filtered.map((quiz) => (
                <Grid key={quiz.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <PublicQuizCard quiz={quiz} />
                </Grid>
              ))}
            </Grid>

            {/* ── Pagination / Load more ─────────────────────────────── */}
            {(hasMore || page > 1) && (
              <Stack spacing={2.5} sx={{ mt: 6, alignItems: 'center' }}>
                <Pagination
                  count={Math.ceil((quizzes.length + (hasMore ? LIMIT : 0)) / LIMIT) || 1}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  boundaryCount={1}
                  siblingCount={1}
                  showFirstButton
                  showLastButton
                  sx={{ '& .MuiPaginationItem-root': { borderRadius: 2 } }}
                />
                {hasMore && (
                  <Button
                    variant="outlined"
                    endIcon={<KeyboardDoubleArrowDownIcon />}
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    sx={{ borderRadius: 999, textTransform: 'none', px: 3.5, py: 1.1, fontWeight: 700 }}
                  >
                    {t('landing.quizzes.loadMore')}
                  </Button>
                )}
              </Stack>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
