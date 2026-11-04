import { useEffect, useRef } from 'react';
import { Avatar, Box, Chip } from '@mui/material';

interface Props {
  stream?: MediaStream | null;
  label: string;
  muted?: boolean;
  mirror?: boolean;
  showAvatar?: boolean; // camera off
  contain?: boolean; // screen share: don't crop
}

export default function VideoTile({ stream, label, muted, mirror, showAvatar, contain }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream ?? null;
  }, [stream]);

  const hideVideo = showAvatar || !stream;

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
    </Box>
  );
}