import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CandidateField, CandidateFieldSection } from '../../types/candidate';
import CandidateFieldListItem from './CandidateFieldListItem';

interface CandidateFieldListProps {
  fields: CandidateField[];
  sections: CandidateFieldSection[];
  onSelect: (fieldId: string) => void;
  onReorder: (from: number, to: number) => void;
  onDelete: (fieldId: string) => void;
}

/**
 * Plain list of fields with up/down reorder. Lighter than `QuestionList`
 * (no search, no type filter) because candidate forms are small and
 * reorder buttons cover the only manipulation needed.
 */
export default function CandidateFieldList({
  fields,
  sections,
  onSelect,
  onReorder,
  onDelete,
}: CandidateFieldListProps) {
  const { t } = useTranslation();

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
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t('candidateFieldsBuilder.title')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('candidateFieldsBuilder.fieldCount', { count: fields.length })}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {fields.length === 0 ? (
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
            <Typography variant="body2">{t('candidateFieldsBuilder.noFieldsYet')}</Typography>
            <Typography variant="caption">{t('candidateFieldsBuilder.clickAddField')}</Typography>
          </Box>
        ) : (
          fields.map((field, index) => (
            <CandidateFieldListItem
              key={field.id}
              field={field}
              index={index}
              total={fields.length}
              section={sections.find((s) => s.id === field.section)}
              onSelect={() => onSelect(field.id)}
              onReorder={onReorder}
              onDelete={() => onDelete(field.id)}
            />
          ))
        )}
      </Box>
    </Paper>
  );
}
