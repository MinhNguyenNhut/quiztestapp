import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  InputAdornment,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import QuestionListItem from './QuestionListItem.tsx';
import type { QuestionFormValues } from '../../types/index.ts';

interface QuestionListProps {
  questions: QuestionFormValues[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onAddQuestion: () => void;
  onSaveQuiz: () => void;
  quizTitle: string;
  onQuizTitleChange: (value: string) => void;
}

export default function QuestionList({
  questions,
  selectedIndex,
  onSelect,
  onDuplicate,
  onDelete,
  onAddQuestion,
  onSaveQuiz,
  quizTitle,
  onQuizTitleChange,
}: QuestionListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = questions.filter((q) => {
    const matchesSearch = q.title?.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Paper
      variant="outlined"
      sx={{
        width: 320,
        minWidth: 320,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        borderTop: 0,
        borderBottom: 0,
        borderLeft: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 600 }}
        >
          Quiz Information
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="Quiz Title"
          value={quizTitle}
          onChange={(e) => onQuizTitleChange(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            Questions
          </Typography>
          <Badge badgeContent={questions.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }} />
        </Box>
        <TextField
          size="small"
          fullWidth
          placeholder="Search question..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 1.5 }}
        />
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="single_choice">Single Choice</MenuItem>
            <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
            <MenuItem value="true_false">True / False</MenuItem>
            <MenuItem value="fill_in_blank">Fill in the Blank</MenuItem>
            <MenuItem value="matching">Matching</MenuItem>
            <MenuItem value="reading_comprehension">Reading Comprehension</MenuItem>
            <MenuItem value="short_answer">Short Answer</MenuItem>
            <MenuItem value="essay">Essay</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {questions.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.disabled',
              textAlign: 'center',
              p: 2,
            }}
          >
            <Typography variant="h4" sx={{ mb: 1, opacity: 0.3 }}>?</Typography>
            <Typography variant="body2">No questions yet</Typography>
            <Typography variant="caption">Click "Add Question" to get started</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
            <Typography variant="body2">No matching questions</Typography>
          </Box>
        ) : (
          filtered.map((question) => {
            const realIndex = questions.indexOf(question);
            return (
              <QuestionListItem
                key={question.id || realIndex}
                question={question}
                index={realIndex}
                isSelected={selectedIndex === realIndex}
                onSelect={() => onSelect(realIndex)}
                onDuplicate={() => onDuplicate(realIndex)}
                onDelete={() => onDelete(realIndex)}
              />
            );
          })
        )}
      </Box>

      {/* Add Button */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<AddIcon />}
          onClick={onAddQuestion}
          sx={{ mb: 1 }}
        >
          Add Question
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={onSaveQuiz}
        >
          Save Quiz
        </Button>
      </Box>
    </Paper>
  );
}
