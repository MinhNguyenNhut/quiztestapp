import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { CandidateField, CandidateFieldSection } from '../../types/candidate';
import { FIELD_TYPE_LABELS } from '../../types/candidate';

interface CandidateFieldListItemProps {
  field: CandidateField;
  index: number;
  total: number;
  section: CandidateFieldSection | undefined;
  onSelect: () => void;
  onReorder: (from: number, to: number) => void;
  onDelete: () => void;
}

const REQUIRED_COLOR = '#ef4444';
const SECTION_COLOR = '#6366f1';
const TYPE_COLOR = '#0ea5e9';

/**
 * One row in the candidate-fields list. Mirrors `QuestionListItem` —
 * number badge, label, type/section/required chips, edit + delete.
 * Up/down arrows for reorder (matches `QuestionList` which uses the
 * same `onReorder(from, to)` callback shape).
 */
export default function CandidateFieldListItem({
  field,
  index,
  total,
  section,
  onSelect,
  onReorder,
  onDelete,
}: CandidateFieldListItemProps) {
  const { t } = useTranslation();

  return (
    <Box
      role="button"
      tabIndex={0}
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
        bgcolor: 'transparent',
        borderLeft: 3,
        borderColor: 'transparent',
        '&:hover': { bgcolor: '#f9fafb' },
      }}
    >
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: '#f3f4f6',
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.75rem',
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5,
            color: 'text.primary',
          }}
        >
          {field.label || t('candidateFieldsBuilder.fieldLabelFallback', { index: index + 1 })}
        </Typography>
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
          <Chip
            label={FIELD_TYPE_LABELS[field.type]}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: `${TYPE_COLOR}15`,
              color: TYPE_COLOR,
              borderRadius: '4px',
            }}
          />
          {section && (
            <Chip
              label={section.title}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: `${SECTION_COLOR}15`,
                color: SECTION_COLOR,
                borderRadius: '4px',
              }}
            />
          )}
          {field.required && (
            <Chip
              label={t('candidate.required')}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: `${REQUIRED_COLOR}15`,
                color: REQUIRED_COLOR,
                borderRadius: '4px',
              }}
            />
          )}
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
        <Tooltip title={t('candidateFieldsBuilder.moveUp')}>
          <span>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onReorder(index, index - 1);
              }}
              disabled={index === 0}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('candidateFieldsBuilder.moveDown')}>
          <span>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onReorder(index, index + 1);
              }}
              disabled={index === total - 1}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t('common.edit')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.delete')}>
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
