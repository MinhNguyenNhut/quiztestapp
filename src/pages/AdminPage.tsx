import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../components/common/ConfirmDialog/ConfirmDialog';
import { adminApi, type AdminUser } from '../api/adminApi';
import { quizApi } from '../api/quizApi';
import type { Quiz } from '../types/quiz';
import { useAppSelector } from '../features/store';

export default function AdminPage() {
  const profile = useAppSelector((state) => state.user.profile);

  if (profile?.role !== 'admin') {
    return <Navigate to="/quizzes" replace />;
  }

  return <AdminDashboard currentUserId={profile.id} />;
}

function AdminDashboard({ currentUserId }: { currentUserId: string }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs value={tab} onChange={(_, value: number) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label={t('admin.usersTab')} />
        <Tab label={t('admin.quizzesTab')} />
      </Tabs>
      {tab === 0
        ? <AdminUsersPage currentUserId={currentUserId} />
        : <AdminQuizzesPage />}
    </Box>
  );
}

function AdminUsersPage({ currentUserId }: { currentUserId: string }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    adminApi.listUsers()
      .then((result) => {
        if (active) setUsers(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(error instanceof Error ? error.message : t('admin.loadFailed'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return users;
    return users.filter((user) =>
      `${user.name} ${user.email} ${user.role}`.toLocaleLowerCase().includes(query),
    );
  }, [search, users]);

  const handleDelete = async () => {
    if (!selectedUser || deleting || selectedUser.id === currentUserId) return;
    setDeleting(true);
    setActionError(null);
    try {
      await adminApi.deleteUser(selectedUser.id);
      setUsers((current) => current.filter((user) => user.id !== selectedUser.id));
      setSelectedUser(null);
      setSuccess(true);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : t('admin.deleteFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('admin.title')}
          </Typography>
          <Typography color="text.secondary">
            {t('admin.usersDescription')}
          </Typography>
        </Box>
        <TextField
          size="small"
          label={t('admin.searchUsers')}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Stack>

      {actionError && (
        <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {loadError ? (
        <Alert severity="error">{loadError}</Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.name')}</TableCell>
                <TableCell>{t('admin.email')}</TableCell>
                <TableCell>{t('admin.role')}</TableCell>
                <TableCell align="right">{t('admin.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {users.length === 0 ? t('admin.noUsers') : t('admin.noMatchingUsers')}
                  </TableCell>
                </TableRow>
              ) : visibleUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name || '—'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell align="right">
                    <Tooltip
                      title={user.id === currentUserId
                        ? t('admin.cannotDeleteSelf')
                        : t('admin.deleteUser')}
                    >
                      <span>
                        <IconButton
                          color="error"
                          aria-label={t('admin.deleteUser')}
                          disabled={user.id === currentUserId}
                          onClick={() => {
                            setActionError(null);
                            setSelectedUser(user);
                          }}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={Boolean(selectedUser)}
        title={t('admin.confirmDeleteTitle')}
        message={t('admin.confirmDeleteMessage', {
          name: selectedUser?.name || selectedUser?.email || '',
        })}
        confirmLabel={deleting ? t('admin.deletingUser') : t('admin.deleteUser')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setSelectedUser(null);
        }}
      />
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message={t('admin.userDeleted')}
      />
    </Box>
  );
}

function AdminQuizzesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<{ page: number; message: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    let active = true;
    quizApi.list(page + 1, pageSize)
      .then((result) => {
        if (!active) return;
        setQuizzes(result.data);
        setTotal(result.total);
        setLoadError(null);
        setLoadedPage(page);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError({
            page,
            message: error instanceof Error ? error.message : t('admin.loadQuizzesFailed'),
          });
          setLoadedPage(page);
        }
      });

    return () => {
      active = false;
    };
  }, [page, t]);

  const loading = loadedPage !== page;
  const currentLoadError = loadError?.page === page ? loadError.message : null;

  const handleDelete = async () => {
    if (!selectedQuiz || deleting) return;
    setDeleting(true);
    setActionError(null);
    try {
      await quizApi.remove(selectedQuiz.id);
      setQuizzes((current) => current.filter((quiz) => quiz.id !== selectedQuiz.id));
      setTotal((current) => Math.max(0, current - 1));
      if (quizzes.length === 1 && page > 0) setPage((current) => current - 1);
      setSelectedQuiz(null);
      setSuccess(true);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : t('admin.deleteQuizFailed'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('admin.quizzesTitle')}
          </Typography>
          <Typography color="text.secondary">
            {t('admin.quizzesDescription')}
          </Typography>
        </Box>
      </Stack>

      {actionError && (
        <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : currentLoadError ? (
        <Alert severity="error">{currentLoadError}</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.quizTitle')}</TableCell>
                <TableCell>{t('admin.owner')}</TableCell>
                <TableCell>{t('admin.updated')}</TableCell>
                <TableCell align="right">{t('admin.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {t('admin.noQuizzes')}
                  </TableCell>
                </TableRow>
              ) : quizzes.map((quiz) => (
                <TableRow key={quiz.id} hover>
                  <TableCell>{quiz.title || t('admin.untitledQuiz')}</TableCell>
                  <TableCell>{quiz.createdBy || quiz.userCreated || '—'}</TableCell>
                  <TableCell>
                    {quiz.updatedAt ? new Date(quiz.updatedAt).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('admin.editQuiz')}>
                      <IconButton
                        aria-label={t('admin.editQuiz')}
                        onClick={() => navigate(`/quiz/${encodeURIComponent(quiz.id)}/edit`)}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('admin.deleteQuiz')}>
                      <IconButton
                        color="error"
                        aria-label={t('admin.deleteQuiz')}
                        onClick={() => {
                          setActionError(null);
                          setSelectedQuiz(quiz);
                        }}
                      >
                        <DeleteOutlinedIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
          />
        </TableContainer>
      )}

      <ConfirmDialog
        open={Boolean(selectedQuiz)}
        title={t('admin.confirmDeleteQuizTitle')}
        message={t('admin.confirmDeleteQuizMessage', {
          title: selectedQuiz?.title || t('admin.untitledQuiz'),
        })}
        confirmLabel={deleting ? t('admin.deletingQuiz') : t('admin.deleteQuiz')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={() => void handleDelete()}
        onCancel={() => {
          if (!deleting) setSelectedQuiz(null);
        }}
      />
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message={t('admin.quizDeleted')}
      />
    </Box>
  );
}
