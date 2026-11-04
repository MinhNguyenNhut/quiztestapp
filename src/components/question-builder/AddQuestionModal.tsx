import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { QuestionType } from '../../types/index.ts';
import {
  getQuestionTypeLabel,
  QUESTION_TYPE_ICONS,
} from '../../types/index.ts';

interface AddQuestionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: QuestionType) => void;
}

const TYPES: QuestionType[] = [
  'single_choice',
  'multiple_choice',
  'true_false',
  'fill_in_blank',
  'matching',
  'reading_comprehension',
  'short_answer',
  'essay',
];

const DESCRIPTION_KEYS: Record<QuestionType, string> = {
  single_choice: 'singleChoice',
  multiple_choice: 'multipleChoice',
  true_false: 'trueFalse',
  fill_in_blank: 'fillInBlank',
  matching: 'matching',
  reading_comprehension: 'readingComprehension',
  short_answer: 'shortAnswer',
  essay: 'essay',
};

export default function AddQuestionModal({ open, onClose, onSelect }: AddQuestionModalProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<QuestionType | null>(null);

  const handleContinue = () => {
    if (selected) {
      onSelect(selected);
      setSelected(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const iconMap: Record<string, string> = {
    radio_button_checked: '○',
    check_box: '☑',
    toggle_on: '⊜',
    edit_note: '✎',
    compare_arrows: '⇄',
    menu_book: '📖',
    short_text: '¶',
    article: '📄',
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle component="div" sx={{ pb: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
          {t('questionBuilder.createNewQuestion')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('questionBuilder.chooseQuestionType')}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2} sx={{ padding: 0.5 }}>
          {TYPES.map((type) => {
            const isSelected = selected === type;
            return (
              <Grid size={{ xs: 12, sm: 6 }} key={type}>
                <Card
                  variant="outlined"
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => setSelected(type)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(type);
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    boxShadow: isSelected ? 2 : 0,
                    outline: isSelected ? '2px solid' : 'none',
                    outlineColor: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.light',
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    },
                    '&:focus-visible': {
                      outline: '3px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2 }}>
                    <Box
                      sx={{
                        fontSize: 28,
                        lineHeight: 1,
                        color: isSelected ? 'primary.main' : 'text.secondary',
                        mt: 0.25,
                      }}
                    >
                      {iconMap[QUESTION_TYPE_ICONS[type]] || '○'}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {getQuestionTypeLabel(type, t)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {t(`questionTypes.descriptions.${DESCRIPTION_KEYS[type]}`)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button variant="contained" disabled={!selected} onClick={handleContinue}>
          {t('questionBuilder.continue')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
