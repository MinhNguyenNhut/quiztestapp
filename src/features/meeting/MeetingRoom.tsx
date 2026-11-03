// src/features/meeting/MeetingRoom.tsx
import { useEffect, useState } from 'react';
import { Alert, Box, Button, IconButton, Snackbar, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate } from 'react-router-dom';
import ChatPanel from './ChatPanel';
import ControlBar from './ControlBar';
import type { Meeting } from './meetingApi';
import { useMeeting } from './useMeeting';
import VideoTile from './VideoTile';

interface Props {
  meeting: Meeting;
  token: string;
  initial: { audio: boolean; video: boolean };
}

export default function MeetingRoom({ meeting, token, initial }: Props) {
  const navigate = useNavigate();
  const m = useMeeting(meeting.roomId, token, initial);

  const [chatOpen, setChatOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (chatOpen) setReadCount(m.messages.length);
  }, [chatOpen, m.messages.length]);

  const unread = chatOpen ? 0 : m.messages.slice(readCount).filter((x) => !x.mine).length;
  const leave = () => navigate('/meeting');

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/meeting/${meeting.roomId}`);
    setCopied(true);
  };

  if (m.status === 'error') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
        <Box sx={{ maxWidth: 420, display: 'grid', gap: 2 }}>
          <Alert severity="error">{m.error}</Alert>
          <Button variant="contained" onClick={leave}>
            Back to meetings
          </Button>
        </Box>
      </Box>
    );
  }

  const remoteEntries = Object.entries(m.remotes);
  const total = remoteEntries.length + 1;
  const cols = total <= 1 ? 1 : total <= 4 ? 2 : total <= 9 ? 3 : 4;
  const sharing = !!m.screenStream;

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#202124',
        color: '#fff',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap sx={{ flex: 1 }}>
          {meeting.title}
          <Typography component="span" variant="body2" sx={{ ml: 1.5, opacity: 0.7 }}>
            {meeting.roomId} · {total} in call
          </Typography>
        </Typography>
        <Tooltip title="Copy meeting link">
          <IconButton onClick={copyLink} sx={{ color: '#fff' }}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Video grid */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          display: 'grid',
          gap: 1.5,
          alignContent: 'center',
          gridTemplateColumns: {
            xs: `repeat(${Math.min(cols, total <= 2 ? 1 : 2)}, 1fr)`,
            md: `repeat(${cols}, 1fr)`,
          },
        }}
      >
        <VideoTile
          stream={m.screenStream ?? m.localStream}
          label={sharing ? 'You (presenting)' : 'You'}
          muted
          mirror={!sharing}
          contain={sharing}
          showAvatar={!sharing && !m.camOn}
        />
        {remoteEntries.map(([id, stream], i) => (
          <VideoTile key={id} stream={stream} label={`Participant ${i + 1}`} />
        ))}
      </Box>

      {m.status === 'connecting' && (
        <Typography align="center" sx={{ opacity: 0.7, pb: 1 }}>
          Joining…
        </Typography>
      )}

      <ControlBar
        micOn={m.micOn}
        camOn={m.camOn}
        sharing={sharing}
        unread={unread}
        onToggleMic={m.toggleMic}
        onToggleCam={m.toggleCam}
        onToggleShare={sharing ? m.stopScreenShare : m.startScreenShare}
        onToggleChat={() => setChatOpen((v) => !v)}
        onLeave={leave}
      />

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={m.messages}
        onSend={m.sendChat}
      />

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Meeting link copied"
      />
    </Box>
  );
}