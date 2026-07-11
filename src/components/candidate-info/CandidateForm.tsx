import { useForm, FormProvider } from 'react-hook-form';
import { Box, Grid, Typography, Paper, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import type { CandidateFieldsConfig, CandidateFormValues, CandidateField } from '../../types/candidate';

interface CandidateFormProps {
  config: CandidateFieldsConfig;
  isLoading?: boolean;
  onSubmit: (data: CandidateFormValues) => void;
}

/**
 * CandidateForm renders a dynamic form based on field configuration
 * Uses React Hook Form for validation and state management
 */
export default function CandidateForm({
  config,
  isLoading = false,
  onSubmit,
}: CandidateFormProps) {
  const { t } = useTranslation();
  const { fields, sections } = config;

  const methods = useForm<CandidateFormValues>({
    mode: 'onBlur',
    defaultValues: fields.reduce((acc, field) => {
      acc[field.id] = field.type === 'checkbox' ? false : '';
      return acc;
    }, {} as CandidateFormValues),
  });

  const { register, watch, setValue, handleSubmit, formState: { errors } } = methods;

  // Group fields by section
  const groupedFields = sections?.length
    ? sections.map((section) => ({
        ...section,
        fields: fields
          .filter((f) => f.section === section.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }))
    : [{ id: 'default', title: t('candidate.title'), fields: fields }];

  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {groupedFields.map((section) => (
          <Box key={section.id} sx={{ mb: 4 }}>
            {section.title && (
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: 'primary.main',
                  pb: 1,
                  borderBottom: '2px solid',
                  borderColor: 'primary.light',
                  display: 'inline-block',
                }}
              >
                {section.title}
              </Typography>
            )}

            <Grid container spacing={3}>
              {section.fields.map((field: CandidateField) => (
                <Grid
                  size={{ xs: 12, sm: field.type === 'textarea' ? 12 : 6 }}
                  key={field.id}
                >
                  <DynamicFieldRenderer
                    field={field}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    error={errors[field.id]}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </form>
    </FormProvider>
  );
}
