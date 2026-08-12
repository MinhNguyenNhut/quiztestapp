import { useEffect, type ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../features/store.ts';
import { initializeAuth, getAuthToken, getAuthInitStatus } from '../../features/auth/authSlice.ts';

export default function AuthInitializer({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(getAuthToken);
  const initStatus = useAppSelector(getAuthInitStatus);

  useEffect(() => {
    if (token) {
      dispatch(initializeAuth());
    }
    // run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isChecking = Boolean(token) && initStatus !== 'succeeded' && initStatus !== 'failed';

  if (isChecking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
