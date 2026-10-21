import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageSwitcher from '../common/LanguageSwitcher/LanguageSwitcher';
import { useAppDispatch, useAppSelector } from '../../features/store.ts';
import { logout, getIsAuthenticated } from '../../features/auth/authSlice.ts';

export default function LandingHeader() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isAuthenticated = useAppSelector(getIsAuthenticated);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);

  const accountMenuOpen = Boolean(accountMenuAnchor);

  const handleMobileMenuOpen = () => setMobileMenuOpen(true);
  const handleMobileMenuClose = () => setMobileMenuOpen(false);
  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) =>
    setAccountMenuAnchor(event.currentTarget);
  const handleAccountClose = () => setAccountMenuAnchor(null);

  const handleProfile = () => {
    handleAccountClose();
    handleMobileMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleAccountClose();
    handleMobileMenuClose();
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNavClick = (id: string) => {
    handleMobileMenuClose();
    // Wait for the drawer to start closing so scrolling isn't interrupted
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const navLinks = [
    { id: 'features', label: t('landing.nav.features') },
    { id: 'how-it-works', label: t('landing.nav.howItWorks') },
    { id: 'quizzes', label: t('landing.nav.quizzes') },
    { id: 'faq', label: t('landing.nav.faq') },
  ];

  return (
    <>
      <AppBar
        component="header"
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          zIndex: (th) => th.zIndex.appBar,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {/* Logo */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <QuizIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              {t('common.quizBuilder')}
            </Typography>
          </Box>

          {/* Desktop */}
          {!isMobile && (
            <>
              <Box
                component="nav"
                aria-label={t('landing.nav.label')}
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {navLinks.map((link) => (
                  <Button
                    key={link.id}
                    color="inherit"
                    onClick={() => handleNavClick(link.id)}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    {link.label}
                  </Button>
                ))}
                <LanguageSwitcher />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                {isAuthenticated ? (
                  <>
                    <Button color="inherit" component={RouterLink} to="/quizzes">
                      {t('landing.myQuizzes')}
                    </Button>
                    <Button variant="contained" component={RouterLink} to="/quiz/new">
                      {t('landing.createQuiz')}
                    </Button>
                    <Tooltip title={t('common.account')}>
                      <IconButton
                        color="inherit"
                        onClick={handleAccountClick}
                        aria-label={t('common.account')}
                        aria-controls={accountMenuOpen ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={accountMenuOpen ? 'true' : undefined}
                      >
                        <AccountCircleIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Button color="inherit" component={RouterLink} to="/login">
                      {t('landing.login')}
                    </Button>
                    <Button variant="contained" component={RouterLink} to="/login">
                      {t('landing.createQuiz')}
                    </Button>
                  </>
                )}
              </Box>
            </>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleMobileMenuOpen}
              aria-label={t('landing.menuOpen')}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: { boxSizing: 'border-box', width: 300 } } }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <LanguageSwitcher />
          <IconButton
            onClick={handleMobileMenuClose}
            edge="end"
            color="inherit"
            aria-label={t('landing.menuClose')}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <Box component="nav" aria-label={t('landing.nav.label')} sx={{ p: 2 }}>
          {navLinks.map((link) => (
            <Button
              key={link.id}
              fullWidth
              color="inherit"
              onClick={() => handleNavClick(link.id)}
              sx={{ justifyContent: 'flex-start', mb: 1, textTransform: 'none' }}
            >
              {link.label}
            </Button>
          ))}
          <Divider sx={{ my: 2 }} />
          {isAuthenticated ? (
            <>
              <Button
                fullWidth
                color="inherit"
                component={RouterLink}
                to="/quizzes"
                onClick={handleMobileMenuClose}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                {t('landing.myQuizzes')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                component={RouterLink}
                to="/quiz/new"
                onClick={handleMobileMenuClose}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                {t('landing.createQuiz')}
              </Button>
              <Divider sx={{ my: 2 }} />
              <Button
                fullWidth
                color="inherit"
                onClick={handleProfile}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                {t('common.profile')}
              </Button>
              <Button
                fullWidth
                color="error"
                onClick={handleLogout}
                sx={{ justifyContent: 'flex-start' }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {t('common.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                color="inherit"
                component={RouterLink}
                to="/login"
                onClick={handleMobileMenuClose}
                sx={{ justifyContent: 'flex-start', mb: 1 }}
              >
                {t('landing.login')}
              </Button>
              <Button
                fullWidth
                variant="contained"
                component={RouterLink}
                to="/login"
                onClick={handleMobileMenuClose}
                sx={{ justifyContent: 'flex-start' }}
              >
                {t('landing.createQuiz')}
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Account dropdown (desktop) */}
      <Menu
        id="account-menu"
        anchorEl={accountMenuAnchor}
        open={accountMenuOpen}
        onClose={handleAccountClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.profile')}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText
            primary={t('common.logout')}
            slotProps={{ primary: { sx: { color: 'error.main' } } }}
          />
        </MenuItem>
      </Menu>
    </>
  );
}
