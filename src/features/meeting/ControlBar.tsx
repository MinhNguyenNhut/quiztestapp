// src/features/meeting/ControlBar.tsx
import { Badge, Box, IconButton, Tooltip } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatIcon from '@mui/icons-material/Chat';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { useTranslation } from 'react-i18next';

interface Props {
  micOn: boolean;
  micAvailable: boolean;
  camOn: boolean;
  camAvailable: boolean;
  sharing: boolean;
  unread: number;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onToggleShare: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
}

const circle = (active: boolean) => ({
  width: 52,
  height: 52,
  color: '#fff',
  bgcolor: active ? 'rgba(255,255,255,0.12)' : 'error.main',
  '&:hover': { bgcolor: active ? 'rgba(255,255,255,0.22)' : 'error.dark' },
});

export default function ControlBar(p: Props) {
  const { t } = useTranslation();
  const canShare = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 2 }}>
      <Tooltip title={p.micAvailable
        ? (p.micOn ? t('meeting.mute') : t('meeting.unmute'))
        : t('meeting.microphoneUnavailableTooltip')}
      >
        <span>
          <IconButton onClick={p.onToggleMic} disabled={!p.micAvailable} sx={circle(p.micOn)}>
            {p.micOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={p.camAvailable
        ? (p.camOn ? t('meeting.turnCameraOff') : t('meeting.turnCameraOn'))
        : t('meeting.cameraUnavailableTooltip')}
      >
        <span>
          <IconButton onClick={p.onToggleCam} disabled={!p.camAvailable} sx={circle(p.camOn)}>
            {p.camOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </span>
      </Tooltip>

      {canShare && (
        <Tooltip title={p.sharing ? t('meeting.stopPresenting') : t('meeting.presentScreen')}>
          <IconButton
            onClick={p.onToggleShare}
            sx={{
              ...circle(true),
              bgcolor: p.sharing ? 'primary.main' : 'rgba(255,255,255,0.12)',
              '&:hover': { bgcolor: p.sharing ? 'primary.dark' : 'rgba(255,255,255,0.22)' },
            }}
          >
            {p.sharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title={t('meeting.chat')}>
        <IconButton onClick={p.onToggleChat} sx={circle(true)}>
          <Badge color="error" badgeContent={p.unread}>
            <ChatIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title={t('meeting.leaveMeeting')}>
        <IconButton
          onClick={p.onLeave}
          sx={{
            ...circle(true),
            width: 64,
            borderRadius: 8,
            bgcolor: 'error.main',
            '&:hover': { bgcolor: 'error.dark' },
          }}
        >
          <CallEndIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}