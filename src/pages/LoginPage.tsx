import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AuthShell from '../components/auth/AuthShell.tsx';
import { authFieldSx, authPanelSx, gradientButtonSx } from '../components/auth/authStyles';
import { useAppDispatch, useAppSelector } from '../features/store.ts';
import { loginUser, getAuthStatus, getAuthError, clearAuthError } from '../features/auth/authSlice.ts';
import type { LoginCredentials } from '../types/user.ts';

export default function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(getAuthStatus);
  const error = useAppSelector(getAuthError);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginCredentials) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      navigate('/quizzes', { replace: true });
    }
  };

  return (
    <AuthShell
      icon={<LockOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />}
      title={t('login.title')}
      subtitle={t('login.subtitle')}
    >
      <Box sx={authPanelSx}>
        {error && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 3, borderRadius: 2.5 }}
            onClose={() => dispatch(clearAuthError())}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: t('login.emailRequired'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('login.emailInvalid'),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('login.email')}
                  type="email"
                  autoComplete="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  fullWidth
                  sx={authFieldSx}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ required: t('login.passwordRequired') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('login.password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
                  fullWidth
                  sx={authFieldSx}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            edge="end"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={t('login.togglePasswordVisibility')}
                          >
                            {showPassword ? (
                              <VisibilityOffIcon fontSize="small" />
                            ) : (
                              <VisibilityIcon fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disableElevation
              loading={status === 'loading'}
              disabled={status === 'loading'}
              sx={gradientButtonSx}
            >
              {t('login.submit')}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        {t('login.noAccount')}{' '}
        <Link
          component={RouterLink}
          to="/register"
          underline="hover"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          {t('login.signUp')}
        </Link>
      </Typography>
    </AuthShell>
  );
}
