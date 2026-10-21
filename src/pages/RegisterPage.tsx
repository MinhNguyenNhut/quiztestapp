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
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import AuthShell from '../components/auth/AuthShell.tsx';
import { authFieldSx, authPanelSx, gradientButtonSx } from '../components/auth/authStyles';
import { useAppDispatch, useAppSelector } from '../features/store.ts';
import { registerUser, getAuthStatus, getAuthError, clearAuthError } from '../features/auth/authSlice.ts';
import type { RegisterCredentials } from '../types/user.ts';

interface RegisterFormValues extends RegisterCredentials {
  confirmPassword: string;
}

type StrengthColor = 'error' | 'warning' | 'success';

function getPasswordStrength(value: string): { score: number; color: StrengthColor } {
  if (value.length === 0) return { score: 0, color: 'error' };
  if (value.length < 6) return { score: 1, color: 'error' };
  const variety = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rx) => rx.test(value)).length;
  if (value.length >= 10 && variety >= 3) return { score: 3, color: 'success' };
  if (variety >= 2) return { score: 2, color: 'warning' };
  return { score: 1, color: 'error' };
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(getAuthStatus);
  const error = useAppSelector(getAuthError);
  const [showPassword, setShowPassword] = useState(false);

  const visibilityToggle = (ariaLabel: string) => (
    <InputAdornment position="end">
      <IconButton
        size="small"
        edge="end"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={ariaLabel}
      >
        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const payload: RegisterCredentials = {
      name: data.name,
      email: data.email,
      password: data.password,
    };
    const result = await dispatch(registerUser(payload));
    if (registerUser.fulfilled.match(result)) {
      navigate('/quizzes', { replace: true });
    }
  };

  return (
    <AuthShell
      icon={<PersonAddOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />}
      title={t('register.title')}
      subtitle={t('register.subtitle')}
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
              name="name"
              control={control}
              rules={{ required: t('register.nameRequired') }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('register.name')}
                  autoComplete="name"
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  fullWidth
                  sx={authFieldSx}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: t('register.emailRequired'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('register.emailInvalid'),
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('register.email')}
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
              rules={{
                required: t('register.passwordRequired'),
                minLength: { value: 6, message: t('register.passwordMinLength') },
              }}
              render={({ field }) => {
                const strength = getPasswordStrength(field.value);
                return (
                  <Box>
                    <TextField
                      {...field}
                      label={t('register.password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message}
                      fullWidth
                      sx={authFieldSx}
                      slotProps={{
                        input: {
                          endAdornment: visibilityToggle(t('register.togglePasswordVisibility')),
                        },
                      }}
                    />
                    {field.value.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(strength.score / 3) * 100}
                          color={strength.color}
                          sx={{ height: 6, borderRadius: 999, flex: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {strength.score}/3
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              }}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: t('register.confirmPasswordRequired'),
                validate: (value) =>
                  value === getValues('password') || t('register.passwordMismatch'),
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t('register.confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword?.message}
                  fullWidth
                  sx={authFieldSx}
                  slotProps={{
                    input: {
                      endAdornment: visibilityToggle(t('register.togglePasswordVisibility')),
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
              {t('register.submit')}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
        {t('register.haveAccount')}{' '}
        <Link
          component={RouterLink}
          to="/login"
          underline="hover"
          sx={{ fontWeight: 700, color: 'primary.main' }}
        >
          {t('register.signIn')}
        </Link>
      </Typography>
    </AuthShell>
  );
}
