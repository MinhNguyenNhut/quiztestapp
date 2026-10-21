import { useTranslation } from 'react-i18next';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SectionHeading from './SectionHeading';

const faqs = ['q1', 'q2', 'q3', 'q4', 'q5'];

export default function FaqSection() {
   const { t } = useTranslation();

   return (
      <Box
         component="section"
         id="faq"
         sx={{ scrollMarginTop: { xs: 56, sm: 64 }, py: { xs: 7, md: 11 }, px: { xs: 2, md: 3 }, bgcolor: 'background.paper' }}
      >
         <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            <SectionHeading align="center" title={t('landing.faq.title')} />
            {faqs.map((q) => (
               <Accordion
                  key={q}
                  disableGutters
                  elevation={0}
                  sx={{
                     mb: 1.5,
                     border: 1,
                     borderColor: 'divider',
                     bgcolor: 'background.default',
                     '&:before': { display: 'none' },
                     '&, &:first-of-type, &:last-of-type': { borderRadius: 2 },
                  }}
               >
                  <AccordionSummary
                     expandIcon={<ExpandMoreIcon />}
                     aria-controls={`faq-${q}-content`}
                     id={`faq-${q}-header`}
                     sx={{ px: 3, py: 0.5 }}
                  >
                     <Typography sx={{ fontWeight: 600 }}>{t(`landing.faq.${q}.question`)}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 3, pb: 3 }}>
                     <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {t(`landing.faq.${q}.answer`)}
                     </Typography>
                  </AccordionDetails>
               </Accordion>
            ))}
         </Box>
      </Box>
   );
}
