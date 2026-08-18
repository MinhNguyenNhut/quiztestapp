import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '../../features/store.ts';
import {
  getAuthToken,
  getAuthInitStatus,
} from '../../features/auth/authSlice.ts';

/**
 * Gates quiz-builder / question-editor / submissions-dashboard pages.
 *
 * Behaviour:
 *  - While we haven't finished verifying a cached token, show a
 *    spinner instead of redirecting — otherwise users refreshing on a
 *    deep link would briefly bounce to /login.
 *  - Once we know there's no token (or the cached token failed), send
 *    them to /login.
 *  - If a 401 fires mid-session, the api client also dispatches
 *    `authSlice.logout`, which clears the token — this component then
 *    sees the same "no token" path and redirects automatically.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = useAppSelector(getAuthToken);
  const initStatus = useAppSelector(getAuthInitStatus);
  const location = useLocation();

  // Only block on init when we actually have something to verify.
  const hasTokenToCheck = Boolean(token);
  const isInitializing =
    hasTokenToCheck && initStatus !== 'succeeded' && initStatus !== 'failed';

  if (isInitializing) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
