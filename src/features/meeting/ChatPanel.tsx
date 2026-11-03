// src/features/meeting/ChatPanel.tsx
import { useEffect, useRef, useState } from 'react';
import { Box, Drawer, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import type { ChatMessage } from './useMeeting';

interface Props {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (message: string) => void;
}

export default function ChatPanel({ open, onClose, messages, onSend }: Props) {
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, open]);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { width: { xs: '100%', sm: 360 }, display: 'flex', flexDirection: 'column' } },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          In-call messages
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.length === 0 && (
          <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
            No messages yet. Messages are only visible to people in the call.
          </Typography>
        )}
        {messages.map((m, i) => (
          <Box key={i} sx={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <Typography variant="caption" color="text.secondary">
              {m.mine ? 'You' : (m.name ?? 'Participant')} ·{' '}
              {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
            <Box
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: m.mine ? 'primary.main' : 'action.hover',
                color: m.mine ? 'primary.contrastText' : 'text.primary',
                wordBreak: 'break-word',
              }}
            >
              {m.message}
            </Box>
          </Box>
        ))}
        <div ref={endRef} />
      </Box>

      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Send a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
        />
        <IconButton color="primary" onClick={send} disabled={!text.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Drawer>
  );
}