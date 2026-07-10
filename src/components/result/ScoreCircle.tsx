import { Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface ScoreCircleProps {
  percentage: number;
  passed: boolean;
  score: number;
  total: number;
}

const colorFor = (passed: boolean): string => (passed ? '#22c55e' : '#ef4444');

export const ScoreCircle = ({ percentage, passed, score, total }: ScoreCircleProps) => {
  const clamped = Math.max(0, Math.min(100, percentage));
  const color = colorFor(passed);
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="overline" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          Overall score
        </Typography>
        <Stack spacing={1} sx={{ my: 1.5, alignItems: "center" }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={100}
              size={160}
              thickness={4}
              sx={{ color: 'rgba(0,0,0,0.06)' }}
            />
            <CircularProgress
              variant="determinate"
              value={clamped}
              size={160}
              thickness={4}
              sx={{ color, position: 'absolute', left: 0 }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, color }}>
                {clamped}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(score * 10) / 10} / {total} pts
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={0.75}>
            {passed ? (
              <CheckCircleIcon fontSize="small" sx={{ color }} />
            ) : (
              <CancelIcon fontSize="small" sx={{ color }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600, color }}>
              {passed ? 'Passed' : 'Did not pass'}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
