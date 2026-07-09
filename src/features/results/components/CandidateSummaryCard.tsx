import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import type { CandidateFormValues, CandidateFieldsConfig } from '../../../types/candidate';
import type { CandidateFieldSection } from '../../../types/candidate';

interface CandidateSummaryCardProps {
  candidate: CandidateFormValues;
  fieldsConfig: CandidateFieldsConfig;
}

/**
 * Renders the candidate information on the result page, mapping each
 * field's value to its label from the fieldsConfig. Organizes by section.
 */
export const CandidateSummaryCard = ({ candidate, fieldsConfig }: CandidateSummaryCardProps) => {
  const sections = fieldsConfig.sections ?? [];
  const fieldsBySection = fieldsConfig.fields.reduce<Record<string, typeof fieldsConfig.fields>>(
    (acc, field) => {
      const sectionId = field.section ?? '';
      if (!acc[sectionId]) acc[sectionId] = [];
      acc[sectionId].push(field);
      return acc;
    },
    {}
  );

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Candidate Information
        </Typography>

        <Stack spacing={2.5}>
          {sections.length === 0 ? (
            // No sections; show all fields
            <Box>
              {fieldsConfig.fields.map((field) => (
                <Box key={field.id} sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 2, mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {field.label}
                  </Typography>
                  <Typography variant="body2">{formatValue(candidate[field.id])}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            // Show sections with fields
            sections.map((section: CandidateFieldSection) => {
              const sectionFields = fieldsBySection[section.id] ?? [];
              if (sectionFields.length === 0) return null;

              return (
                <Box key={section.id}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                    {section.title}
                  </Typography>
                  <Box sx={{ pl: 1 }}>
                    {sectionFields.map((field) => (
                      <Box key={field.id} sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 2, mb: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {field.label}
                        </Typography>
                        <Typography variant="body2">{formatValue(candidate[field.id])}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
