import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, IconButton, Paper, Stack, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../store';
import type { Meeting } from './meetingApi';
import VideoTile from './VideoTile';

interface Props {
  meeting: Meeting;
  onJoin: (opts: { audio: boolean; video: boolean }) => void;
}

export default function PreJoin({ meeting, onJoin }: Props) {
  const { t } = useTranslation();
  const profile = useAppSelector((state) => state.user.profile);
  const translationRef = useRef(t);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [mediaErrorSeverity, setMediaErrorSeverity] = useState<'warning' | 'error'>('error');

  useEffect(() => {
    translationRef.current = t;
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    let media: MediaStream | null = null;

    const requestMedia = async () => {
      const requestVideoOnly = async () => {
        try {
          return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch {
          return null;
        }
      };

      try {
        try {
          media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } catch {
          if (cancelled) return;
          try {
            media = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setMediaError(translationRef.current('meeting.cameraUnavailable'));
            setMediaErrorSeverity('warning');
            setCamOn(false);
          } catch {
            media = await requestVideoOnly();
            setMediaError(translationRef.current('meeting.microphoneUnavailable'));
            setMediaErrorSeverity('warning');
            setMicOn(false);
            setCamOn(Boolean(media?.getVideoTracks().length));
          }
        }
        if (cancelled) {
          media?.getTracks().forEach((track) => track.stop());
          return;
        }
        if (!media) {
          setMediaError(translationRef.current('meeting.noMediaAvailable'));
          setMediaErrorSeverity('warning');
          setMicOn(false);
          setCamOn(false);
        } else {
          setStream(media);
        }
      } catch {
        if (!cancelled) {
          setMediaError(translationRef.current('meeting.noMediaAvailable'));
          setMediaErrorSeverity('warning');
          setMicOn(false);
          setCamOn(false);
        }
      }
    };

    void requestMedia();
    return () => {
      cancelled = true;
      media?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    stream?.getVideoTracks().forEach((track) => (track.enabled = camOn));
    stream?.getAudioTracks().forEach((track) => (track.enabled = micOn));
  }, [stream, camOn, micOn]);

  const camAvailable = Boolean(stream?.getVideoTracks().length);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#202124',
        color: '#fff',
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
          bgcolor: '#303134',
          color: '#fff',
        }}
      >
        <Box>
          <VideoTile
            stream={stream}
            label={profile?.name || t('meeting.you')}
            muted
            mirror
            showAvatar={!camOn}
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2, justifyContent: 'center' }}>
            <IconButton
              aria-label={micOn ? t('meeting.mute') : t('meeting.unmute')}
              onClick={() => setMicOn((value) => !value)}
              disabled={!stream?.getAudioTracks().length}
              sx={{ bgcolor: micOn ? 'action.hover' : 'error.main', color: '#fff' }}
            >
              {micOn ? <MicIcon /> : <MicOffIcon />}
            </IconButton>
            <IconButton
              aria-label={camOn ? t('meeting.turnCameraOff') : t('meeting.turnCameraOn')}
              onClick={() => setCamOn((value) => !value)}
              disabled={!camAvailable}
              sx={{ bgcolor: camOn ? 'action.hover' : 'error.main', color: '#fff' }}
            >
              {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {meeting.title || t('meeting.newMeeting')}
          </Typography>
          <Typography color="text.secondary">
            {t('meeting.readyToJoin')}
          </Typography>
          {mediaError && (
            <Alert severity={mediaErrorSeverity}>{mediaError}</Alert>
          )}
          <Button
            variant="contained"
            size="large"
            onClick={() => onJoin({ audio: micOn, video: camOn && camAvailable })}
          >
            {t('meeting.joinNow')}
          </Button>
          <Button component={RouterLink} to="/meeting" color="inherit">
            {t('meeting.back')}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
