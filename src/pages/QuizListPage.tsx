import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import QuizIcon from '@mui/icons-material/Quiz';
import StarIcon from '@mui/icons-material/Star';
import TimerIcon from '@mui/icons-material/Timer';
import UpdateIcon from '@mui/icons-material/Update';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Link as RouterLink } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../features/quiz/store.ts';
import { addQuiz, deleteQuiz, getQuizzes } from '../features/quiz/quizSlice.ts';
import { quizToFormValues, formValuesToQuiz } from '../utils/quizMappers.ts';
import {
  aggregateDifficulty,
  formatRelativeTime,
  totalEstimatedMinutes,
} from '../utils/quizDisplay.ts';
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  type Quiz,
} from '../types/index.ts';
import ConfirmDialog from '../components/common/ConfirmDialog/ConfirmDialog.tsx';
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info';
};

export default function QuizListPage() {
  const dispatch = useAppDispatch();
  const quizzes = useAppSelector(getQuizzes);

  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Quiz | null>(null);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quizzes;
    return quizzes.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(q) ||
        quiz.description.toLowerCase().includes(q)
    );
  }, [quizzes, search]);

  const showToast = (message: string, severity: ToastState['severity']) =>
    setToast({ open: true, message, severity });

  const handleDuplicate = (quiz: Quiz) => {
    const now = new Date().toISOString();
    const clone = formValuesToQuiz(quizToFormValues(quiz), {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    });
    clone.title = quiz.title + ' (Copy)';
    dispatch(addQuiz(clone));
    showToast('Quiz duplicated', 'success');
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    dispatch(deleteQuiz(confirmDelete.id));
    showToast('Quiz deleted', 'success');
    setConfirmDelete(null);
  };

  const handlePreview = (quiz: Quiz) =>
    showToast('Preview for "' + quiz.title + '" coming soon', 'info');

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      <PageHeader search={search} onSearchChange={setSearch} />

      {quizzes.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
          No quizzes match &ldquo;{search}&rdquo;.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((quiz) => (
            <Grid key={quiz.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <QuizCard
                quiz={quiz}
                onPreview={handlePreview}
                onDuplicate={handleDuplicate}
                onDelete={setConfirmDelete}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete this quiz?"
        message={'"' + (confirmDelete?.title ?? '') + '" will be permanently removed. This cannot be undone.'}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function PageHeader({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        mb: 3
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <LibraryBooksIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          My Quizzes
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ width: { xs: '100%', sm: 'auto' }, alignItems: "stretch" }}
      >
        <TextField
          size="small"
          placeholder="Search quizzes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: { sm: 260 } }}
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
        <Button
          variant="contained"
          component={RouterLink}
          to="/quiz/new"
          startIcon={<AddIcon />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Create Quiz
        </Button>
      </Stack>
    </Stack>
  );
}

function EmptyState() {
  return (
    <Card variant="outlined" sx={{ borderStyle: 'dashed', textAlign: 'center', py: 8 }}>
      <CardContent>
        <LibraryBooksIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          No quizzes yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Create your first quiz to get started. It only takes a minute.
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/quiz/new"
          startIcon={<AddIcon />}
        >
          Create Quiz
        </Button>
      </CardContent>
    </Card>
  );
}

function QuizCard({
  quiz,
  onPreview,
  onDuplicate,
  onDelete,
}: {
  quiz: Quiz;
  onPreview: (quiz: Quiz) => void;
  onDuplicate: (quiz: Quiz) => void;
  onDelete: (quiz: Quiz) => void;
}) {
  const difficulty = aggregateDifficulty(quiz);
  const minutes = totalEstimatedMinutes(quiz);
  const questionCount = quiz.questions.length;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
          {quiz.title || 'Untitled quiz'}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {quiz.description || 'No description'}
        </Typography>

        <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 1.5, flexWrap: "wrap" }}>
          <Chip
            size="small"
            icon={<QuizIcon />}
            label={questionCount + ' Question' + (questionCount === 1 ? '' : 's')}
            variant="outlined"
          />
          {difficulty && (
            <Chip
              size="small"
              icon={<StarIcon />}
              label={DIFFICULTY_LABELS[difficulty]}
              sx={{
                bgcolor: DIFFICULTY_COLORS[difficulty],
                color: 'common.white',
                '& .MuiChip-icon': { color: 'common.white' },
              }}
            />
          )}
          <Chip
            size="small"
            icon={<TimerIcon />}
            label={minutes + ' min' + (minutes === 1 ? '' : 's')}
            variant="outlined"
          />
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <UpdateIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.disabled">
            Updated {formatRelativeTime(quiz.updatedAt)}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="contained"
            component={RouterLink}
            to={'/quiz/' + quiz.id + '/edit'}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="contained"
            component={RouterLink}
            to={`/quiz/${quiz.id}/candidate`}
          >
            Start
          </Button>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Submissions">
            <IconButton
              size="small"
              component={RouterLink}
              to={`/quiz/${quiz.id}/submissions`}
              aria-label={'View submissions for ' + quiz.title}
            >
              <AssessmentIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Preview">
            <IconButton
              size="small"
              onClick={() => onPreview(quiz)}
              aria-label={'Preview ' + quiz.title}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate">
            <IconButton
              size="small"
              onClick={() => onDuplicate(quiz)}
              aria-label={'Duplicate ' + quiz.title}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(quiz)}
              aria-label={'Delete ' + quiz.title}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
}
