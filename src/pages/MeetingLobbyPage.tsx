import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AppAlert from '../components/common/AppAlert/AppAlert';
import ConfirmDialog from '../components/common/ConfirmDialog/ConfirmDialog';
import { copyToClipboard } from '../utils/clipboard';
import {
  createMeeting,
  deleteMeeting,
  getMyMeetings,
  type Meeting,
} from '../api/meetingApi';
import { useAuthToken } from '../hooks/useAuthToken';
import { useAlert } from '../hooks/useAlert';

interface MeetingFormValues {
  title: string;
  maxParticipants: number;
}

export default function MeetingLobbyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthToken();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const { alert, showAlert, closeAlert } = useAlert();
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().max(100, t('meeting.titleTooLong')),
        maxParticipants: z.number().int().min(2).max(8),
      }),
    [t],
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', maxParticipants: 6 },
  });

  useEffect(() => {
    let active = true;
    getMyMeetings(token)
      .then((result) => {
        if (active) setMeetings(result);
      })
      .catch((error: unknown) => {
        if (active) {
          setMeetingsError(error instanceof Error ? error.message : t('common.error'));
        }
      })
      .finally(() => {
        if (active) setLoadingMeetings(false);
      });
    return () => {
      active = false;
    };
  }, [token, t]);

  const onCreate = handleSubmit(async (values) => {
    setCreating(true);
    setCreateError(null);
    try {
      const meeting = await createMeeting(token, {
        title: values.title.trim() || undefined,
        maxParticipants: values.maxParticipants,
      });
      navigate(`/meeting/${encodeURIComponent(meeting.roomId)}`);
    } catch (error: unknown) {
      setCreateError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setCreating(false);
    }
  });

  const handleJoin = () => {
    const value = code.trim();
    if (!value) return;
    let roomId: string;
    try {
      const parsed = new URL(value, window.location.origin);
      roomId = parsed.pathname.split('/').filter(Boolean).pop() ?? '';
    } catch {
      roomId = value.split('/').filter(Boolean).pop() ?? '';
    }
    if (roomId) navigate(`/meeting/${encodeURIComponent(roomId)}`);
  };

  const handleCopyLink = async (roomId: string) => {
    try {
      await copyToClipboard(`${window.location.origin}/meeting/${encodeURIComponent(roomId)}`);
      showAlert(t('meeting.linkCopied'), 'success');
    } catch {
      showAlert(t('meeting.copyFailed'), 'error');
    }
  };

  const handleDeleteMeeting = async () => {
    if (!meetingToDelete || deletingRoomId) return;
    const { roomId } = meetingToDelete;
    setDeletingRoomId(roomId);
    setDeleteError(null);
    try {
      await deleteMeeting(roomId, token);
      setMeetings((current) => current.filter((meeting) => meeting.roomId !== roomId));
      setMeetingToDelete(null);
    } catch (error: unknown) {
      setDeleteError(error instanceof Error ? error.message : t('common.error'));
    } finally {
      setDeletingRoomId(null);
    }
  };

  return (
    <Box sx={{ mx: 'auto', py: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {t('meeting.title')}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t('meeting.subtitle')}
      </Typography>

      <Stack spacing={3}>
        <Card variant="outlined">
          <CardContent>
            <Stack component="form" spacing={2} onSubmit={onCreate} noValidate>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('meeting.startCardTitle')}
              </Typography>
              {createError && <Alert severity="error">{createError}</Alert>}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('meeting.meetingTitle')}
                    error={Boolean(errors.title)}
                    helperText={errors.title?.message}
                    slotProps={{ htmlInput: { maxLength: 100 } }}
                  />
                )}
              />
              <Controller
                name="maxParticipants"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label={t('meeting.maxParticipants')}
                    helperText={t('meeting.participantHint')}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                      <MenuItem key={count} value={count}>{count}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<VideoCallIcon />}
                disabled={creating}
              >
                {creating ? t('meeting.creatingMeeting') : t('meeting.startMeeting')}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('meeting.joinCardTitle')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  fullWidth
                  label={t('meeting.meetingCode')}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleJoin();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<KeyboardIcon />}
                  onClick={handleJoin}
                  disabled={!code.trim()}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {t('meeting.join')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
            {t('meeting.recentTitle')}
          </Typography>
          {loadingMeetings ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : meetingsError ? (
            <Alert severity="error">{meetingsError}</Alert>
          ) : meetings.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Typography color="text.secondary">{t('meeting.noRecentMeetings')}</Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {deleteError && <Alert severity="error">{deleteError}</Alert>}
              <Card variant="outlined">
                {meetings.map((meeting, index) => (
                  <Box key={meeting.roomId}>
                    {index > 0 && <Divider />}
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      sx={{ p: 2, alignItems: { xs: 'stretch', sm: 'center' } }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                          {meeting.title || t('meeting.newMeeting')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {meeting.roomId}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color={meeting.isActive ? 'success' : 'default'}
                        label={meeting.isActive ? t('meeting.active') : t('meeting.ended')}
                      />
                      <Stack direction="row" spacing={1}>
                        {meeting.isActive && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => navigate(`/meeting/${encodeURIComponent(meeting.roomId)}`)}
                          >
                            {t('meeting.join')}
                          </Button>
                        )}
                        <Tooltip title={t('meeting.copyLink')}>
                          <IconButton
                            aria-label={t('meeting.copyLink')}
                            onClick={() => void handleCopyLink(meeting.roomId)}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('meeting.deleteMeeting')}>
                          <span>
                            <IconButton
                              aria-label={t('meeting.deleteMeeting')}
                              color="error"
                              disabled={deletingRoomId === meeting.roomId}
                              onClick={() => {
                                setDeleteError(null);
                                setMeetingToDelete(meeting);
                              }}
                            >
                              <DeleteOutlinedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Card>
            </Stack>
          )}
        </Box>
      </Stack>

      <AppAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={closeAlert}
      />
      <ConfirmDialog
        open={Boolean(meetingToDelete)}
        title={t('meeting.deleteMeetingTitle')}
        message={t('meeting.deleteMeetingConfirm', {
          title: meetingToDelete?.title || meetingToDelete?.roomId || '',
        })}
        confirmLabel={
          deletingRoomId ? t('meeting.deletingMeeting') : t('meeting.deleteMeeting')}
        cancelLabel={t('common.cancel')}
        destructive
        onConfirm={() => void handleDeleteMeeting()}
        onCancel={() => {
          if (!deletingRoomId) setMeetingToDelete(null);
        }}
      />
    </Box>
  );
}
