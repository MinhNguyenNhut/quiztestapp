import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { UseFormHandleSubmit } from 'react-hook-form';
import type { CandidateFormValues } from '../../types/candidate';

interface StartExamButtonProps {
  handleSubmit: UseFormHandleSubmit<CandidateFormValues>;
  onSubmit: (data: CandidateFormValues) => void;
  isSubmitting?: boolean;
}

/**
 * StartExamButton provides a sticky button on mobile for form submission
 * Includes smooth animations and loading state
 */
export default function StartExamButton({
  handleSubmit,
  onSubmit,
  isSubmitting = false,
}: StartExamButtonProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isVisible, setIsVisible] = useState(true);

  // Handle scroll visibility on mobile
  useEffect(() => {
    if (!isMobile) return;

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsVisible(currentScrollY <= lastScrollY || currentScrollY < 100);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  return (
    <Box
      sx={{
        position: isMobile ? 'sticky' : 'relative',
        bottom: isMobile ? 0 : 'auto',
        left: 0,
        right: 0,
        zIndex: isMobile ? 1100 : 'auto',
        backgroundColor: isMobile ? 'background.paper' : 'transparent',
        borderTop: isMobile ? '1px solid' : 'none',
        borderColor: 'divider',
        p: isMobile ? 2 : 0,
        transform: isMobile && !isVisible ? 'translateY(100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: isMobile
          ? '0 -4px 20px -4px rgb(0 0 0 / 0.1)'
          : 'none',
      }}
    >
      <Box
        sx={{
          maxWidth: isMobile ? 'none' : 400,
          mx: isMobile ? 0 : 'auto',
        }}
      >
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PlayArrow />
            )
          }
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 700,
            borderRadius: 2,
            textTransform: 'none',
            boxShadow: '0 4px 14px -3px rgb(99 102 241 / 0.4)',
            '&:hover': {
              boxShadow: '0 6px 20px -3px rgb(99 102 241 / 0.5)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'primary.main',
              color: '#fff',
              opacity: 0.6,
            },
          }}
        >
          {isSubmitting ? t('candidate.startingQuiz') : t('candidate.startQuiz')}
        </Button>
      </Box>
    </Box>
  );
}
