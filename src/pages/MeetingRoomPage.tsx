import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import MeetingRoom from '../components/meeting/MeetingRoom';
import { getMeeting, MeetingApiError, type Meeting } from '../api/meetingApi';
import PreJoin from '../components/meeting/PreJoin';
import { useAuthToken } from '../hooks/useAuthToken';
import ThemePicker from '../components/common/ThemePicker/ThemePicker';

function Centered({ children }: { children: ReactNode }) {
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
      <Box sx={{ display: 'grid', gap: 2, justifyItems: 'center', maxWidth: 420, width: '100%' }}>
        {children}
      </Box>
    </Box>
  );
}

type MeetingLoadState =
  | { roomId: string; status: 'loading' }
  | { roomId: string; status: 'loaded'; meeting: Meeting }
  | { roomId: string; status: 'error'; message: string; notFound: boolean };

export default function MeetingRoomPage() {
  const { t } = useTranslation();
  const { roomId = '' } = useParams();
  const token = useAuthToken();
  const [loadState, setLoadState] = useState<MeetingLoadState>({
    roomId: '',
    status: 'loading',
  });
  const [joinOptions, setJoinOptions] = useState<{
    roomId: string;
    options: { audio: boolean; video: boolean };
  } | null>(null);

  useEffect(() => {
    let active = true;
    getMeeting(roomId, token)
      .then((result) => {
        if (active) setLoadState({ roomId, status: 'loaded', meeting: result });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadState({
          roomId,
          status: 'error',
          message: error instanceof Error ? error.message : t('common.error'),
          notFound: error instanceof MeetingApiError && error.status === 404,
        });
      });
    return () => {
      active = false;
    };
  }, [roomId, token, t]);

  const currentLoad = loadState.roomId === roomId ? loadState : null;
  if (!currentLoad || currentLoad.status === 'loading') {
    return (
      <Centered>
        <CircularProgress />
        <Alert severity="info">{t('meeting.loading')}</Alert>
      </Centered>
    );
  }

  if (currentLoad.status === 'error' && currentLoad.notFound) {
    return (
      <Centered>
        <Alert severity="error">{t('meeting.notFound')}</Alert>
        <Button component={RouterLink} to="/meeting" variant="contained">
          {t('meeting.backToMeetings')}
        </Button>
      </Centered>
    );
  }

  if (currentLoad.status === 'error') {
    return (
      <Centered>
        <Alert severity="error">{currentLoad.message}</Alert>
        <Button component={RouterLink} to="/meeting" variant="contained">
          {t('meeting.backToMeetings')}
        </Button>
      </Centered>
    );
  }

  const meeting = currentLoad.meeting;
  if (!meeting.isActive) {
    return (
      <Centered>
        <Alert severity="info">{t('meeting.meetingEnded')}</Alert>
        <Button component={RouterLink} to="/meeting" variant="contained">
          {t('meeting.backToMeetings')}
        </Button>
      </Centered>
    );
  }

  if (joinOptions?.roomId !== roomId) {
    return (
      <PreJoin
        meeting={meeting}
        onJoin={(options) => setJoinOptions({ roomId, options })}
      />
    );
  }

  return (
    <MeetingRoom
      key={`${roomId}:${token}`}
      meeting={meeting}
      token={token}
      initial={joinOptions.options}
    />
  );
}
