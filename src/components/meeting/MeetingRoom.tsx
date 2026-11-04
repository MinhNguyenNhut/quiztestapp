import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../features/store';
import ThemePicker from '../common/ThemePicker/ThemePicker';
import { endMeeting, type Meeting } from '../../api/meetingApi';
import { useMeeting } from '../../hooks/useMeeting';
import { copyToClipboard } from '../../utils/clipboard';
import ChatPanel from './ChatPanel';
import ControlBar from './ControlBar';
import VideoTile from './VideoTile';

interface Props {
  meeting: Meeting;
  token: string;
  initial: { audio: boolean; video: boolean };
}

export default function MeetingRoom({ meeting, token, initial }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const profile = useAppSelector((state) => state.user.profile);
  const m = useMeeting(meeting.roomId, token, initial);

  const [chatOpen, setChatOpen] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const unread = chatOpen ? 0 : m.messages.slice(readCount).filter((message) => !message.mine).length;
  const leave = () => navigate('/meeting');
  const isHost = Boolean(profile?.id && meeting.hostId === profile.id);

  const copyLink = async () => {
    try {
      await copyToClipboard(
        `${window.location.origin}/meeting/${encodeURIComponent(meeting.roomId)}`,
      );
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };

  const handleEndMeeting = async () => {
    setMenuAnchor(null);
    setEnding(true);
    setEndError(null);
    try {
      await endMeeting(meeting.roomId, token);
      navigate('/meeting');
    } catch (error: unknown) {
      setEndError(error instanceof Error ? error.message : t('meeting.endMeetingFailed'));
      setEnding(false);
    }
  };

  if (m.status === 'error' || m.status === 'ended') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          p: 2,
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Box sx={{ position: 'absolute', top: 12, right: 16 }}>
          <ThemePicker />
        </Box>
        <Box sx={{ maxWidth: 420, display: 'grid', gap: 2 }}>
          <Alert severity={m.status === 'ended' ? 'info' : 'error'}>
            {m.error ?? t('meeting.meetingEnded')}
          </Alert>
          <Button variant="contained" onClick={leave}>
            {t('meeting.backToMeetings')}
          </Button>
        </Box>
      </Box>
    );
  }

  const remotePeerIds = [...new Set([...m.peerIds, ...Object.keys(m.remotes)])];
  const total = remotePeerIds.length + 1;
  const cols = total <= 1 ? 1 : total <= 4 ? 2 : total <= 9 ? 3 : 4;
  const sharing = Boolean(m.screenStream);

  return (
    <Box
      sx={{
        height: '100dvh',
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, py: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
          {meeting.title || t('meeting.newMeeting')}
          <Typography component="span" variant="body2" sx={{ ml: 1.5, opacity: 0.7 }}>
            {meeting.roomId} · {t('meeting.inCall', { count: total })}
          </Typography>
        </Typography>
        <Tooltip title={t('meeting.copyLinkTooltip')}>
          <IconButton onClick={() => void copyLink()} aria-label={t('meeting.copyLinkTooltip')}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <ThemePicker />
        {isHost && (
          <>
            <Tooltip title={t('meeting.endMeetingForAll')}>
              <IconButton
                aria-label={t('meeting.endMeetingForAll')}
                onClick={(event) => setMenuAnchor(event.currentTarget)}
                disabled={ending}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={() => void handleEndMeeting()} disabled={ending}>
                {ending ? t('meeting.endingMeeting') : t('meeting.endMeetingForAll')}
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      {endError && (
        <Alert severity="error" onClose={() => setEndError(null)} sx={{ mx: 2 }}>
          {endError}
        </Alert>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          px: 2,
          display: 'grid',
          gap: 1.5,
          alignContent: 'center',
          justifyContent: 'center',
          gridTemplateRows: 'minmax(0, 1fr)',
          gridTemplateColumns: {
            xs: total === 1
              ? 'minmax(0, min(100%, calc((100dvh - 190px) * 16 / 9)))'
              : `repeat(${Math.min(cols, total <= 2 ? 1 : 2)}, minmax(0, 1fr))`,
            md: total === 1
              ? 'minmax(0, min(100%, calc((100dvh - 190px) * 16 / 9)))'
              : `repeat(${cols}, minmax(0, 1fr))`,
          },
        }}
      >
        <VideoTile
          stream={m.screenStream ?? m.localStream}
          label={sharing
            ? t('meeting.presenting')
            : profile?.name || t('meeting.you')}
          muted
          mirror={!sharing}
          contain={sharing}
          showAvatar={!sharing && !m.camOn}
        />
        {remotePeerIds.map((id, index) => (
          <VideoTile
            key={id}
            stream={m.remotes[id] ?? null}
            label={m.names[id] || t('meeting.participantNumber', { number: index + 1 })}
          />
        ))}
      </Box>

      {m.status === 'connecting' && (
        <Typography align="center" sx={{ opacity: 0.7, pb: 1 }}>
          {t('meeting.joining')}
        </Typography>
      )}

      <ControlBar
        micOn={m.micOn}
        micAvailable={Boolean(m.localStream?.getAudioTracks().length)}
        camOn={m.camOn}
        camAvailable={m.camAvailable}
        sharing={sharing}
        unread={unread}
        onToggleMic={m.toggleMic}
        onToggleCam={m.toggleCam}
        onToggleShare={sharing ? m.stopScreenShare : m.startScreenShare}
        onToggleChat={() => {
          if (chatOpen) {
            setChatOpen(false);
          } else {
            setReadCount(m.messages.length);
            setChatOpen(true);
          }
        }}
        onLeave={leave}
      />

      <ChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={m.messages}
        chatError={m.chatError}
        onSend={m.sendChat}
      />

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message={t('meeting.linkCopied')}
      />
      <Snackbar open={copyError} autoHideDuration={3000} onClose={() => setCopyError(false)}>
        <Alert severity="error" onClose={() => setCopyError(false)}>
          {t('meeting.copyFailed')}
        </Alert>
      </Snackbar>
    </Box>
  );
}
