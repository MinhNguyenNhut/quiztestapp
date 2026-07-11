import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import type { QuestionFormValues, QuestionType } from '../../types/index.ts';
import { QUESTION_TYPE_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../../types/index.ts';

interface QuestionListItemProps {
  question: QuestionFormValues;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const TYPE_COLORS: Record<QuestionType, string> = {
  single_choice: '#6366f1',
  multiple_choice: '#8b5cf6',
  true_false: '#06b6d4',
  fill_in_blank: '#f59e0b',
  matching: '#10b981',
  reading_comprehension: '#3b82f6',
  short_answer: '#ec4899',
  essay: '#f97316',
};

export default function QuestionListItem({
  question,
  index,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: QuestionListItemProps) {
  const { t } = useTranslation();

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        p: 1.5,
        mb: 0.5,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        bgcolor: isSelected ? '#eef2ff' : 'transparent',
        borderLeft: 3,
        borderColor: isSelected ? 'primary.main' : 'transparent',
        '&:hover': {
          bgcolor: isSelected ? '#eef2ff' : '#f9fafb',
        },
      }}
    >
      {/* Number badge */}
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: isSelected ? 'primary.main' : '#f3f4f6',
          color: isSelected ? 'white' : 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.75rem',
          mt: 0.25,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
            color: isSelected ? 'primary.main' : 'text.primary',
          }}
        >
          {question.title || t('questionBuilder.questionFallback', { number: index + 1 })}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip
            label={QUESTION_TYPE_LABELS[question.type]}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: `${TYPE_COLORS[question.type]}15`,
              color: TYPE_COLORS[question.type],
              borderRadius: '4px',
            }}
          />
          <Chip
            label={DIFFICULTY_LABELS[question.difficulty]}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: `${DIFFICULTY_COLORS[question.difficulty]}15`,
              color: DIFFICULTY_COLORS[question.difficulty],
              borderRadius: '4px',
            }}
          />
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0, opacity: 0.6, '&:hover': { opacity: 1 } }}>
        <Tooltip title={t('common.edit')}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.duplicate')}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.delete')}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
