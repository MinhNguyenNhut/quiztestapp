import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import PersonIcon from '@mui/icons-material/Person';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useAppSelector } from '../features/store.ts';
import { getAuthToken } from '../features/auth/authSlice.ts';
import { fetchMe } from '../api/authApi.ts';
import ThemePicker from '../components/common/ThemePicker/ThemePicker';

type User = {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
};

interface InfoTileProps {
  icon: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}

function InfoTile({ icon, label, value, mono }: InfoTileProps) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2.5,
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'background.paper',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.16)}`,
          },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {label}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
              fontSize: mono ? '0.875rem' : undefined,
              wordBreak: 'break-all',
            }}
          >
            {value || '—'}
          </Typography>
        </Box>
      </Box>
    </Grid>
  );
}

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
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress size={44} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          p: 3,
          bgcolor: 'background.default',
        }}
      >
        <Alert severity="error" variant="filled" sx={{ borderRadius: 3, maxWidth: 480 }}>
          {error}
        </Alert>
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 4, sm: 6 } }}>
      {/* ── Gradient cover with back button ─────────────────────────── */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 150, sm: 190 },
          background: (theme) =>
            `linear-gradient(150deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 100%)`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: (theme) => alpha(theme.palette.common.white, 0.08),
            top: -160,
            right: -80,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: (theme) => alpha(theme.palette.common.white, 0.06),
            bottom: -120,
            left: -60,
          }}
        />

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/quizzes', { replace: true })}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: '#fff',
            borderColor: (theme) => alpha(theme.palette.common.white, 0.5),
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              borderColor: '#fff',
              bgcolor: (theme) => alpha(theme.palette.common.white, 0.14),
            },
          }}
        >
          {t('profile.backToQuizzes')}
        </Button>
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 16,
            borderRadius: '50%',
            bgcolor: (theme) => alpha(theme.palette.common.white, 0.16),
            color: '#fff',
          }}
        >
          <ThemePicker />
        </Box>
      </Box>

      {/* ── Profile card overlapping the cover ──────────────────────── */}
      <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Card
          variant="outlined"
          sx={{
            mt: -10,
            borderRadius: 4,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 20px 50px rgba(0, 0, 0, 0.3)'
                : '0 20px 50px rgba(15, 23, 42, 0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Header */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 3 }}
              sx={{
                alignItems: { xs: 'center', sm: 'flex-end' },
                textAlign: { xs: 'center', sm: 'left' },
                mb: 4,
              }}
            >
              <Avatar
                sx={{
                  width: 112,
                  height: 112,
                  fontSize: 36,
                  border: '6px solid',
                  borderColor: 'background.paper',
                  background: (theme) =>
                    `linear-gradient(150deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: (theme) =>
                    `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              >
                {initials || <PersonIcon sx={{ fontSize: 48 }} />}
              </Avatar>

              <Box sx={{ pb: 0.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 0.5 }}>
                  {displayName}
                </Typography>
                <Typography color="text.secondary">{user.email}</Typography>
              </Box>
            </Stack>

            {/* Section heading */}
            <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, alignItems: 'center' }}>
              <Box
                sx={{
                  width: 4,
                  height: 22,
                  borderRadius: 999,
                  background: (theme) =>
                    `linear-gradient(180deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('profile.profileInformation')}
              </Typography>
            </Stack>

            {/* Info tiles */}
            <Grid container spacing={2.5}>
              <InfoTile
                icon={<PersonOutlinedIcon />}
                label={t('profile.name')}
                value={user.name ?? ''}
              />
              <InfoTile
                icon={<EmailOutlinedIcon />}
                label={t('profile.email')}
                value={user.email}
              />
              {user.id && (
                <InfoTile
                  icon={<BadgeOutlinedIcon />}
                  label={t('profile.userId')}
                  value={user.id}
                  mono
                />
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
