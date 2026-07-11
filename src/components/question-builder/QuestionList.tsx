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
import { useTranslation } from 'react-i18next';
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
  isSaving: boolean;
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
  isSaving
}: QuestionListProps) {
  const { t } = useTranslation();
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
          {t('questionBuilder.quizInformation')}
        </Typography>

        <TextField
          fullWidth
          size="small"
          label={t('quizEditor.quizTitle')}
          value={quizTitle}
          onChange={(e) => onQuizTitleChange(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            {t('questionBuilder.questionsHeader')}
          </Typography>
          <Badge badgeContent={questions.length} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }} />
        </Box>
        <TextField
          size="small"
          fullWidth
          placeholder={t('questionBuilder.searchQuestionPlaceholder')}
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
          <InputLabel>{t('questionBuilder.typeLabel')}</InputLabel>
          <Select
            value={typeFilter}
            label={t('questionBuilder.typeLabel')}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">{t('questionBuilder.allTypes')}</MenuItem>
            <MenuItem value="single_choice">{t('questionTypes.singleChoice')}</MenuItem>
            <MenuItem value="multiple_choice">{t('questionTypes.multipleChoice')}</MenuItem>
            <MenuItem value="true_false">{t('questionTypes.trueFalse')}</MenuItem>
            <MenuItem value="fill_in_blank">{t('questionTypes.fillInBlank')}</MenuItem>
            <MenuItem value="matching">{t('questionTypes.matching')}</MenuItem>
            <MenuItem value="reading_comprehension">{t('questionTypes.readingComprehension')}</MenuItem>
            <MenuItem value="short_answer">{t('questionTypes.shortAnswer')}</MenuItem>
            <MenuItem value="essay">{t('questionTypes.essay')}</MenuItem>
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
            <Typography variant="body2">{t('questionBuilder.noQuestionsYet')}</Typography>
            <Typography variant="caption">{t('questionBuilder.clickAddQuestion')}</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
            <Typography variant="body2">{t('questionBuilder.noMatchingQuestions')}</Typography>
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
          {t('questionBuilder.addQuestion')}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={onSaveQuiz}
          disabled={isSaving}
        >
          {isSaving ? t('questionBuilder.saving') : t('quizEditor.saveQuiz')}
        </Button>
      </Box>
    </Paper>
  );
}
