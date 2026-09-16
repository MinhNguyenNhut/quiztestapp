import { memo, useState, useMemo } from 'react';
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
import { useWatch, type Control } from 'react-hook-form';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import QuestionListItem from './QuestionListItem.tsx';
import type { QuizFormValues, QuestionFormValues } from '../../types/index.ts';

interface QuestionListProps {
  fieldIds: string[];
  control: Control<QuizFormValues>;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onAddQuestion: () => void;
  onSaveQuiz: () => void;
  quizTitle: string;
  onQuizTitleChange: (value: string) => void;
  estimatedTime?: number;
  onEstimatedTimeChange: (value: number) => void;
  isSaving: boolean;
}

function QuestionList({
  fieldIds,
  control,
  selectedIndex,
  onSelect,
  onDuplicate,
  onDelete,
  onAddQuestion,
  onSaveQuiz,
  quizTitle,
  onQuizTitleChange,
  estimatedTime,
  onEstimatedTimeChange,
  isSaving,
}: QuestionListProps) {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [prevQuizTitle, setPrevQuizTitle] = useState(quizTitle);
  const [localQuizTitle, setLocalQuizTitle] = useState(quizTitle);

  const [prevEstimatedTime, setPrevEstimatedTime] = useState(estimatedTime);
  const [localEstimatedTime, setLocalEstimatedTime] = useState<number>(
    estimatedTime !== undefined && estimatedTime !== null
      ? Number(estimatedTime)
      : 0
  );

  if (quizTitle !== prevQuizTitle) {
    setPrevQuizTitle(quizTitle);
    setLocalQuizTitle(quizTitle);
  }

  if (estimatedTime !== prevEstimatedTime) {
    setPrevEstimatedTime(estimatedTime);
    setLocalEstimatedTime(estimatedTime ?? 0);
  }

  const isFiltering = search.trim() !== '' || typeFilter !== 'all';
  const watchedQuestions = useWatch({
    control,
    name: 'questions',
    disabled: !isFiltering,
  }) as Pick<QuestionFormValues, 'title' | 'type'>[] | undefined;

  const allIndices = useMemo(() => fieldIds.map((_, i) => i), [fieldIds]);

  const filteredIndices = useMemo(() => {
    if (!isFiltering || !watchedQuestions) return allIndices;
    return allIndices.filter((index) => {
      const q = watchedQuestions[index];
      const matchesSearch = q?.title?.toLowerCase().includes(search.toLowerCase()) ?? false;
      const matchesType = typeFilter === 'all' || q?.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [allIndices, isFiltering, watchedQuestions, search, typeFilter]);

  const handleQuizTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalQuizTitle(event.target.value);
  };

  const handleQuizTitleBlur = () => {
    if (localQuizTitle !== quizTitle) {
      onQuizTitleChange(localQuizTitle);
    }
  };

  const handleEstimatedTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setLocalEstimatedTime(value === '' ? 0 : Number(value));
  };

  const handleEstimatedTimeBlur = () => {
    if (localEstimatedTime !== (estimatedTime ?? 0)) {
      onEstimatedTimeChange(localEstimatedTime);
    }
  };

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
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            fontWeight: 600,
          }}
        >
          {t('questionBuilder.quizInformation')}
        </Typography>

        {/* Quiz title & Estimated Time */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label={t('quizEditor.quizTitle')}
            value={localQuizTitle}
            onChange={handleQuizTitleChange}
            onBlur={handleQuizTitleBlur}
          />
          <TextField
            fullWidth
            size="small"
            type="number"
            label={t('quizEditor.estimatedTime')}
            value={localEstimatedTime}
            onChange={handleEstimatedTimeChange}
            onBlur={handleEstimatedTimeBlur}
            slotProps={{ htmlInput: { min: 0 } }}
          />
        </Box>

        {/* Questions header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {t('questionBuilder.questionsHeader')}
          </Typography>

          <Badge
            badgeContent={fieldIds.length}
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
              },
            }}
          />
        </Box>

        {/* Search */}
        <TextField
          size="small"
          fullWidth
          placeholder={t(
            'questionBuilder.searchQuestionPlaceholder',
          )}
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

        {/* Type filter */}
        <FormControl size="small" fullWidth>
          <InputLabel>
            {t('questionBuilder.typeLabel')}
          </InputLabel>

          <Select
            value={typeFilter}
            label={t('questionBuilder.typeLabel')}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">
              {t('questionBuilder.allTypes')}
            </MenuItem>

            <MenuItem value="single_choice">
              {t('questionTypes.singleChoice')}
            </MenuItem>

            <MenuItem value="multiple_choice">
              {t('questionTypes.multipleChoice')}
            </MenuItem>

            <MenuItem value="true_false">
              {t('questionTypes.trueFalse')}
            </MenuItem>

            <MenuItem value="fill_in_blank">
              {t('questionTypes.fillInBlank')}
            </MenuItem>

            <MenuItem value="matching">
              {t('questionTypes.matching')}
            </MenuItem>

            <MenuItem value="reading_comprehension">
              {t('questionTypes.readingComprehension')}
            </MenuItem>

            <MenuItem value="short_answer">
              {t('questionTypes.shortAnswer')}
            </MenuItem>

            <MenuItem value="essay">
              {t('questionTypes.essay')}
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* List */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1,
        }}
      >
        {fieldIds.length === 0 ? (
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
            <Typography
              variant="h4"
              sx={{
                mb: 1,
                opacity: 0.3,
              }}
            >
              ?
            </Typography>

            <Typography variant="body2">
              {t('questionBuilder.noQuestionsYet')}
            </Typography>

            <Typography variant="caption">
              {t('questionBuilder.clickAddQuestion')}
            </Typography>
          </Box>
        ) : filteredIndices.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.disabled',
            }}
          >
            <Typography variant="body2">
              {t('questionBuilder.noMatchingQuestions')}
            </Typography>
          </Box>
        ) : (
          filteredIndices.map((index) => (
            <QuestionListItem
              key={fieldIds[index]}
              control={control}
              index={index}
              isSelected={selectedIndex === index}
              onSelect={onSelect}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))
        )}
      </Box>

      {/* Add / Save buttons */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
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
          {isSaving
            ? t('questionBuilder.saving')
            : t('quizEditor.saveQuiz')}
        </Button>
      </Box>
    </Paper>
  );
}

export default memo(QuestionList);