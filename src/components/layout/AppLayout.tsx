import { useState } from 'react';
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import QuizIcon from '@mui/icons-material/Quiz';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AddIcon from '@mui/icons-material/Add';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../common/LanguageSwitcher/LanguageSwitcher';
import { useAppDispatch, useAppSelector } from '../../features/store.ts';
import { logout } from '../../features/auth/authSlice.ts';

const drawerWidth = 240;

export default function AppLayout() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userRole = useAppSelector((state) => state.user.profile?.role);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);

  const isQuizRoute =
    location.pathname === '/quizzes' || location.pathname.startsWith('/quiz/');
  const isCreateRoute = location.pathname === '/quiz/new';
  const isQuizEditorRoute =
    location.pathname === '/quiz/new' || /^\/quiz\/[^/]+\/edit$/.test(location.pathname);

  const closeMenus = () => {
    setMobileOpen(false);
    setAccountMenuAnchor(null);
  };

  const handleLogout = () => {
    closeMenus();
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <QuizIcon sx={{ mr: 1 }} color="primary" />
        <Typography
          component={RouterLink}
          to="/quizzes"
          variant="h6"
          sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 700 }}
          onClick={closeMenus}
        >
          {t('common.quizBuilder')}
        </Typography>
      </Toolbar>
      <Divider />
      <List
        subheader={
          <ListSubheader component="div">{t('layout.sidebar.quizzes')}</ListSubheader>
        }
      >
        <ListItemButton
          component={RouterLink}
          to="/quizzes"
          selected={isQuizRoute}
          onClick={closeMenus}
        >
          <ListItemIcon><LibraryBooksIcon /></ListItemIcon>
          <ListItemText primary={t('layout.sidebar.myQuizzes')} />
        </ListItemButton>
        <ListItemButton
          component={RouterLink}
          to="/quiz/new"
          selected={isCreateRoute}
          onClick={closeMenus}
        >
          <ListItemIcon><AddIcon /></ListItemIcon>
          <ListItemText primary={t('layout.sidebar.createQuiz')} />
        </ListItemButton>
      </List>
      {userRole === 'admin' && (
        <List>
          <ListItemButton
            component={RouterLink}
            to="/admin"
            selected={location.pathname.startsWith('/admin')}
            onClick={closeMenus}
          >
            <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
            <ListItemText primary={t('admin.title')} />
          </ListItemButton>
        </List>
      )}
      <List
        subheader={
          <ListSubheader component="div">{t('layout.sidebar.meetingSection')}</ListSubheader>
        }
      >
        <ListItemButton
          component={RouterLink}
          to="/meeting"
          selected={location.pathname === '/meeting'}
          onClick={closeMenus}
        >
          <ListItemIcon><VideoCallIcon /></ListItemIcon>
          <ListItemText primary={t('layout.sidebar.meetings')} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            aria-label={t('layout.sidebar.openMenu')}
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <LanguageSwitcher />
          <Tooltip title={t('common.account')}>
            <IconButton
              color="inherit"
              onClick={(event) => setAccountMenuAnchor(event.currentTarget)}
              aria-label={t('common.account')}
              aria-haspopup="true"
            >
              <AccountCircleIcon fontSize="large" />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={accountMenuAnchor}
            open={Boolean(accountMenuAnchor)}
            onClose={() => setAccountMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                closeMenus();
                navigate('/profile');
              }}
            >
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={t('common.profile')} />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText
                primary={t('common.logout')}
                slotProps={{ primary: { sx: { color: 'error.main' } } }}
              />
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: isQuizEditorRoute ? 'hidden' : 'auto',
            p: isQuizEditorRoute ? 0 : { xs: 2, sm: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
