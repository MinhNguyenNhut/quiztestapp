import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  HelpOutlined,
  Person,
  Speed,
  CalendarToday,
} from '@mui/icons-material';
import type { QuizOverview } from '../../types/candidate';
import { DIFFICULTY_COLORS } from '../../types/quiz';

interface QuizOverviewCardProps {
  quiz: QuizOverview;
}

/**
 * QuizOverviewCard displays the quiz information in a card format
 * Shows cover image, title, description, and metadata
 */
export default function QuizOverviewCard({ quiz }: QuizOverviewCardProps) {
  const difficultyColor = DIFFICULTY_COLORS[quiz.difficulty];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.12)',
        },
      }}
    >
      {quiz.coverImage && (
        <CardMedia
          component="img"
          height="200"
          image={quiz.coverImage}
          alt={quiz.title}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          {quiz.title}
        </Typography>

        {quiz.description && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.7 }}
          >
            {quiz.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {quiz.estimatedTime && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccessTime sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                Estimated Time:{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {quiz.estimatedTime} minutes
                </Box>
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HelpOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Questions:{' '}
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {quiz.questionCount}
              </Box>
            </Typography>
          </Box>

          {quiz.passingScore !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Speed sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                Passing Score:{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {quiz.passingScore}%
                </Box>
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Speed sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Speed sx={{ color: 'text.secondary', fontSize: 20 }} />

              <Typography variant="body2" color="text.secondary">
                Difficulty:
              </Typography>

              <Chip
                label={quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                size="small"
                sx={{
                  bgcolor: difficultyColor,
                  color: '#fff',
                  fontWeight: 600,
                  height: 24,
                }}
              />
            </Box>
          </Box>

          {quiz.createdBy && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                Created By:{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {quiz.createdBy}
                </Box>
              </Typography>
            </Box>
          )}

          {quiz.createdAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                Created:{' '}
                <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </Box>
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
