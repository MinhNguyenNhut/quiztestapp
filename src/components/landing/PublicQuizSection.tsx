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
  CircularProgress,
  Pagination,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim().toLowerCase());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce search; reset to page 1 whenever the search text actually changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = search.trim();
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

  // Reset page to 1 when debouncedSearch changes - handled by key on PublicQuizSection in parent
  // No separate effect needed; page is reset via key on the component

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 3 },
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Section header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, mb: 1 }}>
                {t('landing.quizzes.label')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {t('landing.quizzes.title')}
              </Typography>
            </Box>
            <TextField
              size="small"
              placeholder={t('landing.quizzes.searchPlaceholder')}
              value={search}
              onChange={handleSearchChange}
              sx={{ minWidth: { sm: 280 }, maxWidth: 400 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </Box>

        {/* Error state */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Content */}
        {isLoading && filtered.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Card variant="outlined" sx={{ borderStyle: 'dashed', textAlign: 'center', py: 8 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t('landing.quizzes.emptyTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {debouncedSearch
                  ? t('landing.quizzes.noResults', { search })
                  : t('landing.quizzes.emptyDescription')}
              </Typography>
              {debouncedSearch && (
                <Button
                  variant="outlined"
                  onClick={() => setSearch('')}
                >
                  {t('landing.quizzes.clearSearch')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Grid container spacing={3}>
              {filtered.map((quiz) => (
                <Grid key={quiz.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <PublicQuizCard quiz={quiz} />
                </Grid>
              ))}
            </Grid>

            {/* Pagination / Load more */}
            {(hasMore || page > 1) && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'center', width: '100%' }}>
                  <Pagination
                    count={Math.ceil((quizzes.length + (hasMore ? LIMIT : 0)) / LIMIT) || 1}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    boundaryCount={1}
                    siblingCount={1}
                    showFirstButton
                    showLastButton
                    sx={{ flexGrow: 1 }}
                  />
                  {hasMore && !isLoading && (
                    <Button
                      variant="outlined"
                      startIcon={<SearchIcon />}
                      onClick={handleLoadMore}
                      disabled={isLoading}
                    >
                      {t('landing.quizzes.loadMore')}
                    </Button>
                  )}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}