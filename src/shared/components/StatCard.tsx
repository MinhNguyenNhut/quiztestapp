import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  color?: string;
}

export const StatCard = ({ label, value, hint, icon, color }: StatCardProps) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderRadius: 2,
      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
    }}
  >
    <CardContent>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1, alignItems: "center" }}>
        {icon && (
          <Box
            sx={{
              color: color ?? 'primary.main',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </Box>
        )}
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ lineHeight: 1, fontWeight: 600 }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 700, color: color ?? 'text.primary' }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </CardContent>
  </Card>
);
