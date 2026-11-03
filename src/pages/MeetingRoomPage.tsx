// src/pages/MeetingRoomPage.tsx
import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import MeetingRoom from '../features/meeting/MeetingRoom';
import { getMeeting, type Meeting } from '../features/meeting/meetingApi';
import PreJoin from '../features/meeting/PreJoin';
import { useAuthToken } from '../features/meeting/useAuthToken';

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Box sx={{ display: 'grid', gap: 2, justifyItems: 'center', maxWidth: 420 }}>{children}</Box>
    </Box>
  );
}

export default function MeetingRoomPage() {
  const { roomId = '' } = useParams();
  const token = useAuthToken();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [joinOpts, setJoinOpts] = useState<{ audio: boolean; video: boolean } | null>(null);

  useEffect(() => {
    setMeeting(null);
    setLoadError(null);
    getMeeting(roomId, token)
      .then(setMeeting)
      .catch((e: Error) => setLoadError(e.message));
  }, [roomId, token]);

  if (loadError || (meeting && !meeting.isActive)) {
    return (
      <Centered>
        <Alert severity="error">{loadError ?? 'This meeting has ended.'}</Alert>
        <Button component={RouterLink} to="/meeting" variant="contained">
          Back to meetings
        </Button>
      </Centered>
    );
  }

  if (!meeting) {
    return (
      <Centered>
        <CircularProgress />
      </Centered>
    );
  }

  if (!joinOpts) return <PreJoin meeting={meeting} onJoin={setJoinOpts} />;

  return <MeetingRoom meeting={meeting} token={token} initial={joinOpts} />;
}