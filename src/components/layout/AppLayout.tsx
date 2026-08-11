import { Outlet } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import LanguageSwitcher from '../common/LanguageSwitcher/LanguageSwitcher';

export default function AppLayout() {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <QuizIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              {t('common.quizBuilder')}
            </RouterLink>
          </Typography>
          <LanguageSwitcher />
          <Button color="inherit" component={RouterLink} to="/">
            {t('common.myQuizzes')}
          </Button>
          <Button color="inherit" component={RouterLink} to="/quiz/new">
            {t('common.createQuiz')}
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} disableGutters sx={{ mt: 0, mb: 0, px: 0, flex: 1, overflow: 'auto' }}>
        <Outlet />
      </Container>
    </Box>
  );
}
