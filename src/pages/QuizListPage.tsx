import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

export default function QuizListPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      <Typography color="text.secondary">
        No quizzes yet. Create your first quiz to get started.
      </Typography>
    </Box>
  );
}
