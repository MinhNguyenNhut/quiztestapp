import { Outlet } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';

export default function AppLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <QuizIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Quiz Builder
            </RouterLink>
          </Typography>
          <Button color="inherit" component={RouterLink} to="/">
            My Quizzes
          </Button>
          <Button color="inherit" component={RouterLink} to="/quiz/new">
            Create Quiz
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} disableGutters sx={{ mt: 0, mb: 0, px: 0, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
