import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { useSelector } from 'react-redux';
import { getQuizzes } from '../features/quiz/quizSlice';

export default function QuizListPage() {
  const quizzes = useSelector(getQuizzes);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">My Quizzes</Typography>

        <Button
          variant="contained"
          component={RouterLink}
          to="/quiz/new"
          startIcon={<AddIcon />}
        >
          Create Quiz
        </Button>
      </Box>

      {quizzes.length === 0 ? (
        <Typography color="text.secondary">
          No quizzes yet. Create your first quiz to get started.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardContent>
                <Typography variant="h6">{quiz.title}</Typography>

                <Typography color="text.secondary">
                  {quiz.questions.length} question
                  {quiz.questions.length !== 1 ? 's' : ''}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
