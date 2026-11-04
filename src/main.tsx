import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './features/store.ts';
import { router } from './router.tsx';
import { AppThemeProvider } from './theme/AppThemeProvider.tsx';
import AuthInitializer from './components/auth/AuthInitializer.tsx';
import { setUnauthorizedHandler } from './api/httpClient.ts';
import { logout } from './features/auth/authSlice.ts';
import './index.css';
import './i18n';

// Global 401 handler: any API call that returns 401 will dispatch the
// `logout` action, which clears the token from Redux and localStorage
// and flips `getIsAuthenticated` to false, so any `<ProtectedRoute>`
// snapshot will redirect on the next render.
setUnauthorizedHandler(() => {
  store.dispatch(logout());
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppThemeProvider>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </AppThemeProvider>
    </Provider>
  </StrictMode>,
);
