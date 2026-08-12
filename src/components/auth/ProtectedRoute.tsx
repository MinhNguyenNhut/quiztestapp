import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAppSelector } from '../../features/store.ts';
import { getIsAuthenticated } from '../../features/auth/authSlice.ts';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector(getIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
