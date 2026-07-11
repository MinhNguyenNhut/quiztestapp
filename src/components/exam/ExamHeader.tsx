import { Box, Card, CardContent, Stack, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import type { ReactNode } from 'react';
import { AutoSaveStatusChip } from './AutoSaveStatusChip';
import type { AutoSaveStatus as AutoSaveStatusType } from '../../features/exam/examSlice';

interface ExamHeaderProps {
  quizTitle: string;
  candidateName: string;
  fullscreen: boolean;
  fullscreenSupported: boolean;
  onToggleFullscreen: () => void;
  onBack: () => void;
  autoSaveStatus: AutoSaveStatusType;
  online: boolean;
  /** Optional right-side element (typically the timer). */
  trailing?: ReactNode;
}

export const ExamHeader = ({
  quizTitle,
  candidateName,
  fullscreen,
  fullscreenSupported,
  onToggleFullscreen,
  onBack,
  autoSaveStatus,
  online,
  trailing,
}: ExamHeaderProps) => {
  const { t } = useTranslation();

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          px: { xs: 2, md: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Tooltip title={t('examUi.backToCandidateInfo')}>
          <IconButton onClick={onBack} aria-label={t('examUi.backToCandidateInfo')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>

        <Stack sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
            {quizTitle}
          </Typography>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.75}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {candidateName || t('exam.candidateFallback')}
            </Typography>
            <Chip
              icon={online ? <WifiIcon fontSize="small" /> : <WifiOffIcon fontSize="small" />}
              label={online ? t('examUi.online') : t('examUi.offline')}
              size="small"
              color={online ? 'success' : 'warning'}
              variant="outlined"
              sx={{ height: 20, '& .MuiChip-label': { px: 0.5, fontSize: '0.7rem' } }}
            />
          </Stack>
        </Stack>

        <AutoSaveStatusChip status={autoSaveStatus} online={online} />

        {fullscreenSupported && (
          <Tooltip title={fullscreen ? t('examUi.exitFullscreen') : t('examUi.enterFullscreen')}>
            <IconButton onClick={onToggleFullscreen} aria-label={t('examUi.toggleFullscreen')}>
              {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        )}

        {trailing && (
          <Card variant="outlined" sx={{ borderRadius: 2, display: { xs: 'none', sm: 'block' } }}>
            <CardContent sx={{ p: '8px 12px !important' }}>
              <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {trailing}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};
