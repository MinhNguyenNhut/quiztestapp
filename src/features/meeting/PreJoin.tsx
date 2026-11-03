// src/features/meeting/PreJoin.tsx
import { useEffect, useState } from 'react';
import { Alert, Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Link as RouterLink } from 'react-router-dom';
import type { Meeting } from './meetingApi';
import VideoTile from './VideoTile';

interface Props {
  meeting: Meeting;
  onJoin: (opts: { audio: boolean; video: boolean }) => void;
}

export default function PreJoin({ meeting, onJoin }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let media: MediaStream | undefined;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        media = s;
        setStream(s);
      })
      .catch(() => setMediaError('Allow camera and microphone access in your browser to join.'));
    return () => {
      cancelled = true;
      media?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = camOn));
  }, [stream, camOn]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          maxWidth: 900,
          width: '100%',
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
          alignItems: 'center',
        }}
      >
        <Box>
          <VideoTile stream={stream} label="You" muted mirror showAvatar={!camOn} />
          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
            <IconButton
              onClick={() => setMicOn((v) => !v)}
              sx={{ bgcolor: micOn ? 'action.hover' : 'error.main', color: micOn ? 'inherit' : '#fff' }}
            >
              {micOn ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            <IconButton
              onClick={() => setCamOn((v) => !v)}
              sx={{ bgcolor: camOn ? 'action.hover' : 'error.main', color: camOn ? 'inherit' : '#fff' }}
            >
              {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={600}>
            {meeting.title}
          </Typography>
          <Typography color="text.secondary">
            Ready to join? Check your camera and microphone first.
          </Typography>
          {mediaError && <Alert severity="warning">{mediaError}</Alert>}
          <Button
            variant="contained"
            size="large"
            disabled={!!mediaError}
            onClick={() => onJoin({ audio: micOn, video: camOn })}
          >
            Join now
          </Button>
          <Button component={RouterLink} to="/meeting" color="inherit">
            Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}