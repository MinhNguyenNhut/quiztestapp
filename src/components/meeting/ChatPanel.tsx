import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Drawer, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { useTranslation } from 'react-i18next';
import type { ChatMessage } from '../../hooks/useMeeting';

interface Props {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  chatError: boolean;
  onSend: (message: string) => void;
}

export default function ChatPanel({ open, onClose, messages, chatError, onSend }: Props) {
  const { t } = useTranslation();
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
          {t('meeting.inCallMessages')}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {chatError && (
        <Alert severity="error" sx={{ mx: 2, mb: 1 }}>
          {t('meeting.chatPersistFailed')}
        </Alert>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.length === 0 && (
          <Typography color="text.secondary" variant="body2" sx={{ mt: 2 }}>
            {t('meeting.noMessages')}
          </Typography>
        )}
        {messages.map((m) => (
          <Box key={m.id} sx={{ alignSelf: m.mine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            <Typography variant="caption" color="text.secondary">
              {m.mine ? t('meeting.you') : (m.name ?? t('meeting.unknownParticipant'))} ·{' '}
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
          placeholder={t('meeting.sendMessage')}
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