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

interface Props {
  micOn: boolean;
  camOn: boolean;
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
  const canShare = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 2 }}>
      <Tooltip title={p.micOn ? 'Mute' : 'Unmute'}>
        <IconButton onClick={p.onToggleMic} sx={circle(p.micOn)}>
          {p.micOn ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
      </Tooltip>

      <Tooltip title={p.camOn ? 'Turn off camera' : 'Turn on camera'}>
        <IconButton onClick={p.onToggleCam} sx={circle(p.camOn)}>
          {p.camOn ? <VideocamIcon /> : <VideocamOffIcon />}
        </IconButton>
      </Tooltip>

      {canShare && (
        <Tooltip title={p.sharing ? 'Stop presenting' : 'Present screen'}>
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

      <Tooltip title="Chat">
        <IconButton onClick={p.onToggleChat} sx={circle(true)}>
          <Badge color="error" badgeContent={p.unread}>
            <ChatIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Leave meeting">
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