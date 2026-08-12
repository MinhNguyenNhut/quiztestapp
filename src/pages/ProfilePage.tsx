import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../features/store.ts';
import { getAuthToken } from '../features/auth/authSlice.ts';
import { fetchMe } from '../api/authApi.ts';

type User = {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAppSelector(getAuthToken);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await fetchMe(token);
        setUser(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t('profile.loadFailed'),
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token, navigate, t]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 700, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.name ||
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
    user.email;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}
      >
        {t('profile.backToQuizzes')}
      </Button>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'center', sm: 'center' },
              mb: 4,
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: 28,
              }}
            >
              {initials || <PersonIcon />}
            </Avatar>

            <Box
              sx={{
                textAlign: { xs: 'center', sm: 'left' },
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 700 }}
              >
                {displayName}
              </Typography>

              <Typography color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          {/* Profile information */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            {t('profile.profileInformation')}
          </Typography>

          <Stack spacing={2.5}>
            <TextField
              label={t('profile.firstName')}
              value={user.firstName ?? ''}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label={t('profile.lastName')}
              value={user.lastName ?? ''}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            <TextField
              label={t('profile.email')}
              value={user.email}
              fullWidth
              slotProps={{
                input: {
                  readOnly: true,
                },
              }}
            />

            {user.id && (
              <TextField
                label={t('profile.userId')}
                value={user.id}
                fullWidth
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
