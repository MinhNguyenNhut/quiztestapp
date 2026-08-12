import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
   Box,
   Card,
   CardContent,
   Typography,
   TextField,
   Button,
   Stack,
   Alert,
   InputAdornment,
   IconButton,
   Link,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useAppDispatch, useAppSelector } from '../features/store.ts';
import { registerUser, getAuthStatus, getAuthError, clearAuthError } from '../features/auth/authSlice.ts';
import type { RegisterCredentials } from '../types/user.ts';

interface RegisterFormValues extends RegisterCredentials {
   confirmPassword: string;
}

export default function RegisterPage() {
   const { t } = useTranslation();
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const status = useAppSelector(getAuthStatus);
   const error = useAppSelector(getAuthError);
   const [showPassword, setShowPassword] = useState(false);

   const {
      control,
      handleSubmit,
      watch,
      formState: { errors },
   } = useForm<RegisterFormValues>({
      defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
   });

   const password = watch('password');

   const onSubmit = async (data: RegisterFormValues) => {
      const { confirmPassword: _confirmPassword, ...payload } = data;
      const result = await dispatch(registerUser(payload));
      if (registerUser.fulfilled.match(result)) {
         navigate('/', { replace: true });
      }
   };

   return (
      <Box
         sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            bgcolor: 'grey.50',
         }}
      >
         <Card variant="outlined" sx={{ maxWidth: 420, width: '100%' }}>
            <CardContent sx={{ p: 4 }}>
               <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
                  <PersonAddOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                     {t('register.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                     {t('register.subtitle')}
                  </Typography>
               </Stack>

               {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => dispatch(clearAuthError())}>
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
                        render={({ field }) => (
                           <TextField
                              {...field}
                              label={t('register.password')}
                              type={showPassword ? 'text' : 'password'}
                              autoComplete="new-password"
                              error={Boolean(errors.password)}
                              helperText={errors.password?.message}
                              fullWidth
                              slotProps={{
                                 input: {
                                    endAdornment: (
                                       <InputAdornment position="end">
                                          <IconButton
                                             size="small"
                                             onClick={() => setShowPassword((v) => !v)}
                                             aria-label={t('register.togglePasswordVisibility')}
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

                     <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{
                           required: t('register.confirmPasswordRequired'),
                           validate: (value) => value === password || t('register.passwordMismatch'),
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
                           />
                        )}
                     />

                     <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        loading={status === 'loading'}
                        disabled={status === 'loading'}
                     >
                        {t('register.submit')}
                     </Button>
                  </Stack>
               </Box>

               <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
                  {t('register.haveAccount')}{' '}
                  <Link component={RouterLink} to="/login">
                     {t('register.signIn')}
                  </Link>
               </Typography>
            </CardContent>
         </Card>
      </Box>
   );
}
