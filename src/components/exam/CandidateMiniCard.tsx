import { Avatar, Box, Card, CardContent, Stack, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

interface CandidateMiniCardProps {
  name: string;
  email?: string;
  avatarUrl?: string;
  score: number;
  total: number;
  timeLeftSeconds: number;
}

const initials = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const CandidateMiniCard = ({
  name,
  email,
  avatarUrl,
  score,
  total,
  timeLeftSeconds,
}: CandidateMiniCardProps) => (
  <Card variant="outlined" sx={{ borderRadius: 2 }}>
    <CardContent sx={{ pb: '16px !important' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Avatar
          src={avatarUrl}
          sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontWeight: 600 }}
        >
          {!avatarUrl && (name ? initials(name) : <PersonIcon />)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
            {name || 'Candidate'}
          </Typography>
          {email && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {email}
            </Typography>
          )}
        </Box>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Live score
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {score}/{total}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Time left
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timeLeftSeconds)}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);
