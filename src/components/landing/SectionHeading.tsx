import { Box, Typography } from '@mui/material';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeading({ title, subtitle, align = 'left' }: SectionHeadingProps) {
  return (
    <Box sx={{ textAlign: align, mb: { xs: 4, md: 6 }, maxWidth: 640, mx: align === 'center' ? 'auto' : 0 }}>
      <Typography
        variant="h3"
        component="h2"
        sx={{ fontWeight: 800, letterSpacing: -0.5, fontSize: { xs: '1.85rem', md: '2.5rem' }, mb: subtitle ? 1.5 : 0 }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.6 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
