import { Box, Button, Divider, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ExamFooterProps {
  isFirst: boolean;
  isLast: boolean;
  isFlagged: boolean;
  hasAnswer: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  onClear: () => void;
  onSubmit: () => void;
  onSaveNow: () => void;
}

export const ExamFooter = ({
  isFirst,
  isLast,
  isFlagged,
  hasAnswer,
  onPrevious,
  onNext,
  onToggleFlag,
  onClear,
  onSubmit,
  onSaveNow,
}: ExamFooterProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="footer"
      sx={{
        position: { xs: 'sticky', md: 'static' },
        bottom: 0,
        zIndex: 50,
        backgroundColor: 'background.paper',
        borderTop: { xs: '1px solid', md: 'none' },
        borderColor: 'divider',
        boxShadow: { xs: '0 -4px 12px rgba(0,0,0,0.06)', md: 'none' },
        px: { xs: 2, md: 0 },
        py: 1.5,
        mt: { md: 2 },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: "stretch" }}
        divider={isMobile ? undefined : <Divider orientation="vertical" flexItem />}
      >
        <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
          <Button
            variant="outlined"
            onClick={onPrevious}
            disabled={isFirst}
            startIcon={<NavigateBeforeIcon />}
            sx={{ minWidth: 110 }}
          >
            {t('examUi.previous')}
          </Button>
          <Button
            variant={isLast ? 'outlined' : 'contained'}
            onClick={onNext}
            disabled={isLast}
            endIcon={<NavigateNextIcon />}
            sx={{ minWidth: 110 }}
          >
            {t('examUi.next')}
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Tooltip title={isFlagged ? t('examUi.removeFlag') : t('examUi.flagForReview')}>
            <Button
              variant="outlined"
              color={isFlagged ? 'warning' : 'inherit'}
              onClick={onToggleFlag}
              startIcon={isFlagged ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            >
              {isFlagged ? t('examUi.flagged') : t('examUi.flag')}
            </Button>
          </Tooltip>
          <Tooltip title={t('examUi.clearAnswer')}>
            <span>
              <Button
                variant="outlined"
                color="inherit"
                onClick={onClear}
                disabled={!hasAnswer}
                startIcon={<DeleteSweepIcon />}
              >
                {t('examUi.clear')}
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            onClick={onSaveNow}
            startIcon={<SaveIcon />}
          >
            {t('examUi.save')}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={onSubmit}
            startIcon={<CheckCircleIcon />}
            sx={{ ml: { sm: 'auto' } }}
          >
            {t('examUi.submitExam')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
