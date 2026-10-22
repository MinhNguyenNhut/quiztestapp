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
  EmojiEvents,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import type { QuizOverview } from '../../types/candidate';
import { DIFFICULTY_COLORS } from '../../types/quiz';

interface QuizOverviewCardProps {
  quiz: QuizOverview;
  unlimitedTime?: boolean;
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', '& svg': { fontSize: 20 } }}>
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {label}:
        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {children}
        </Box>
      </Typography>
    </Box>
  );
}

/**
 * Displays quiz information: cover image, title, description and metadata.
 */
export default function QuizOverviewCard({ quiz, unlimitedTime = false }: QuizOverviewCardProps) {
  const { t, i18n } = useTranslation();
  const difficultyColor = DIFFICULTY_COLORS[quiz.difficulty];
  const dateLocale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US';

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 32px -8px rgb(15 23 42 / 0.10)',
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

      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
          {quiz.title}
        </Typography>

        {quiz.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
            {quiz.description}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {unlimitedTime ? (
            <InfoRow icon={<AccessTime />} label={t('candidate.estimatedTime')}>
              {t('candidate.unlimitedTime')}
            </InfoRow>
          ) : (
            quiz.estimatedTime && (
              <InfoRow icon={<AccessTime />} label={t('candidate.estimatedTime')}>
                {t('candidate.minutesUnit', { count: quiz.estimatedTime })}
              </InfoRow>
            )
          )}

          <InfoRow icon={<HelpOutlined />} label={t('candidate.questionsLabel')}>
            {quiz.questionCount}
          </InfoRow>

          {quiz.passingScore !== undefined && (
            <InfoRow icon={<EmojiEvents />} label={t('candidate.passingScore')}>
              {quiz.passingScore}%
            </InfoRow>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Speed sx={{ color: 'text.secondary', fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              {t('candidate.difficultyLabel')}:
            </Typography>
            <Chip
              label={t(`difficulty.${quiz.difficulty}`)}
              size="small"
              sx={{
                bgcolor: difficultyColor,
                color: '#fff',
                fontWeight: 600,
                height: 24,
              }}
            />
          </Box>

          {quiz.userCreated && (
            <InfoRow icon={<Person />} label={t('candidate.createdBy')}>
              {quiz.userCreated}
            </InfoRow>
          )}

          {quiz.createdAt && (
            <InfoRow icon={<CalendarToday />} label={t('candidate.createdLabel')}>
              {new Date(quiz.createdAt).toLocaleDateString(dateLocale)}
            </InfoRow>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}