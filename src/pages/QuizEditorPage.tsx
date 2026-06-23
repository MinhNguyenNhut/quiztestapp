import { Box } from '@mui/material';
import QuestionBuilder from '../components/question-builder/QuestionBuilder.tsx';

export default function QuizEditorPage() {
  return (
    <Box sx={{ height: 'calc(100vh - 64px)' }}>
      <QuestionBuilder />
    </Box>
  );
}
