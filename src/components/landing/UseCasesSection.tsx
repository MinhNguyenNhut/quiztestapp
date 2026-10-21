import { useTranslation } from 'react-i18next';
import { Box, Grid, Stack, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SectionHeading from './SectionHeading';

const cases = [
   { key: 'teachers', icon: <SchoolIcon fontSize="large" /> },
   { key: 'hr', icon: <WorkIcon fontSize="large" /> },
   { key: 'trainers', icon: <GroupsIcon fontSize="large" /> },
   { key: 'communities', icon: <EmojiEventsIcon fontSize="large" /> },
];

export default function UseCasesSection() {
   const { t } = useTranslation();

   return (
      <Box
         component="section"
         id="use-cases"
         sx={{ scrollMarginTop: { xs: 56, sm: 64 }, py: { xs: 7, md: 11 }, px: { xs: 2, md: 3 }, bgcolor: 'background.paper' }}
      >
         <Grid container spacing={{ xs: 2, md: 8 }} sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Grid size={{ xs: 12, md: 5 }}>
               <Box sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
                  <SectionHeading title={t('landing.useCases.title')} subtitle={t('landing.useCases.subtitle')} />
               </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
               {cases.map((c) => (
                  <Stack
                     key={c.key}
                     direction="row"
                     spacing={3}
                     sx={{ py: 3.5, borderTop: 1, borderColor: 'divider', '&:last-of-type': { borderBottom: 1 } }}
                  >
                     <Box sx={{ color: 'primary.main', display: 'flex', pt: 0.5 }}>{c.icon}</Box>
                     <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                           {t(`landing.useCases.${c.key}.title`)}
                        </Typography>
                        <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                           {t(`landing.useCases.${c.key}.description`)}
                        </Typography>
                     </Box>
                  </Stack>
               ))}
            </Grid>
         </Grid>
      </Box>
   );
}
