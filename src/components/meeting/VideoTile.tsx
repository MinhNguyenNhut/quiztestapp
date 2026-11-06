import { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Chip, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useTranslation } from 'react-i18next';

interface Props {
  stream?: MediaStream | null;
  audioStream?: MediaStream | null;
  micAvailable?: boolean;
  micOn?: boolean;
  label: string;
  muted?: boolean;
  mirror?: boolean;
  showAvatar?: boolean; // camera off
  contain?: boolean; // screen share: don't crop
}

export default function VideoTile({
  stream,
  audioStream = stream,
  micAvailable = true,
  micOn = true,
  label,
  muted,
  mirror,
  showAvatar,
  contain,
}: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLVideoElement>(null);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream ?? null;
  }, [stream]);

  useEffect(() => {
    const track = audioStream?.getAudioTracks()[0];
    if (!track || typeof AudioContext === 'undefined') {
      setSpeaking(false);
      return;
    }

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(new MediaStream([track]));
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const samples = new Uint8Array(analyser.fftSize);
    let frame = 0;
    let lastCheck = 0;
    let currentSpeaking = false;

    const checkAudioLevel = (time: number) => {
      frame = requestAnimationFrame(checkAudioLevel);
      if (time - lastCheck < 100) return;
      lastCheck = time;

      analyser.getByteTimeDomainData(samples);
      const rms = Math.sqrt(
        samples.reduce((sum, sample) => sum + (sample - 128) ** 2, 0) / samples.length,
      ) / 128;
      const nextSpeaking =
        track.enabled && !track.muted && rms > (currentSpeaking ? 0.025 : 0.04);

      if (nextSpeaking !== currentSpeaking) {
        currentSpeaking = nextSpeaking;
        setSpeaking(nextSpeaking);
      }
    };

    frame = requestAnimationFrame(checkAudioLevel);

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      analyser.disconnect();
      void audioContext.close();
      setSpeaking(false);
    };
  }, [audioStream]);

  const hideVideo = showAvatar || !stream;
  const micMuted = !micAvailable || !micOn;
  const showMicStatus = micMuted || speaking;
  const micLabel = micMuted
    ? micAvailable
      ? t('meeting.microphoneMuted')
      : t('meeting.microphoneUnavailableTooltip')
    : t('meeting.speaking');

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        aspectRatio: '16 / 9',
        width: '100%',
      }}
    >
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        style={{
          width: '100%',
          height: '100%',
          objectFit: contain ? 'contain' : 'cover',
          transform: mirror ? 'scaleX(-1)' : undefined,
          visibility: hideVideo ? 'hidden' : 'visible', // keeps audio playing when hidden
          background: '#000',
        }}
      />
      {hideVideo && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <Avatar sx={{ width: 72, height: 72, fontSize: 32, bgcolor: 'primary.main' }}>
            {label.charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      )}
      <Chip
        size="small"
        label={label}
        sx={{
          position: 'absolute',
          left: 12,
          bottom: 12,
          color: '#fff',
          bgcolor: 'rgba(0,0,0,0.55)',
        }}
      />
      {showMicStatus && (
        <Tooltip title={micLabel}>
          <Box
            role="status"
            aria-label={micLabel}
            sx={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              width: 32,
              height: 32,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              bgcolor: micMuted ? 'error.main' : 'success.main',
              color: micMuted ? 'common.white' : 'success.contrastText',
              boxShadow: (theme) =>
                `0 0 0 4px ${theme.palette[micMuted ? 'error' : 'success'].main}40`,
            }}
          >
            {micMuted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
}