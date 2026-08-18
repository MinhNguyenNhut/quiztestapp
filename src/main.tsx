import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './features/store.ts';
import { router } from './router.tsx';
import theme from './theme/index.ts';
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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
