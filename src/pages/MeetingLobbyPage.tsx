// src/pages/MeetingLobbyPage.tsx
import { useState } from 'react';
import {
  Alert, Button, Card, CardContent, Container, Divider, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { useNavigate } from 'react-router-dom';
import { createMeeting } from '../features/meeting/meetingApi';
import { useAuthToken } from '../features/meeting/useAuthToken';

export default function MeetingLobbyPage() {
  const navigate = useNavigate();
  const token = useAuthToken();

  const [title, setTitle] = useState('');
  const [max, setMax] = useState(6);
  const [code, setCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const meeting = await createMeeting(token, {
        title: title.trim() || undefined,
        maxParticipants: max,
      });
      navigate(`/meeting/${meeting.roomId}`);
    } catch (e) {
      setError((e as Error).message);
      setCreating(false);
    }
  };

  const handleJoin = () => {
    // accepts "a3f9c21b7e" or a full link ".../meeting/a3f9c21b7e"
    const roomId = code.trim().split('/').filter(Boolean).pop();
    if (roomId) navigate(`/meeting/${roomId}`);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Video meetings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Start an instant meeting or join one with a code.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6">New meeting</Typography>
            <TextField
              label="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            <TextField
              select
              label="Max participants"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              helperText="Peer-to-peer calls work best with up to 6 people"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              size="large"
              startIcon={<VideoCallIcon />}
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Start meeting'}
            </Button>

            <Divider>or</Divider>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                label="Meeting code or link"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <Button
                variant="outlined"
                startIcon={<KeyboardIcon />}
                onClick={handleJoin}
                disabled={!code.trim()}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Join
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}