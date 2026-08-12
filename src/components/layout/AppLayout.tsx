import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';

import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';

import QuizIcon from '@mui/icons-material/Quiz';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

import LanguageSwitcher from '../common/LanguageSwitcher/LanguageSwitcher';
import { useAppDispatch } from '../../features/store.ts';
import { logout } from '../../features/auth/authSlice.ts';

export default function AppLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [accountMenuAnchor, setAccountMenuAnchor] =
    useState<null | HTMLElement>(null);

  const accountMenuOpen = Boolean(accountMenuAnchor);

  const handleAccountClick = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleProfile = () => {
    handleAccountClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleAccountClose();
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppBar position="static" elevation={0}>
        <Toolbar>
          {/* Logo */}
          <QuizIcon sx={{ mr: 1 }} />

          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
            }}
          >
            <RouterLink
              to="/"
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {t('common.quizBuilder')}
            </RouterLink>
          </Typography>

          {/* Language */}
          <LanguageSwitcher />

          {/* My Quizzes */}
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
          >
            {t('common.myQuizzes')}
          </Button>

          {/* Create Quiz */}
          <Button
            color="inherit"
            component={RouterLink}
            to="/quiz/new"
          >
            {t('common.createQuiz')}
          </Button>

          {/* Account */}
          <Tooltip title={t('common.account')}>
            <IconButton
              color="inherit"
              onClick={handleAccountClick}
              aria-controls={
                accountMenuOpen ? 'account-menu' : undefined
              }
              aria-haspopup="true"
              aria-expanded={
                accountMenuOpen ? 'true' : undefined
              }
            >
              <AccountCircleIcon fontSize="large" />
            </IconButton>
          </Tooltip>

          {/* Account dropdown */}
          <Menu
            id="account-menu"
            anchorEl={accountMenuAnchor}
            open={accountMenuOpen}
            onClose={handleAccountClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {/* Profile */}
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>

              <ListItemText>
                {t('common.profile')}
              </ListItemText>
            </MenuItem>

            <Divider />

            {/* Logout */}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon
                  fontSize="small"
                  color="error"
                />
              </ListItemIcon>

              <ListItemText
                primary={t('common.logout')}
                slotProps={{
                  primary: {
                    sx: {
                      color: 'error.main',
                    },
                  },
                }}
              />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container
        maxWidth={false}
        disableGutters
        sx={{
          mt: 0,
          mb: 0,
          px: 0,
          flex: 1,
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}
