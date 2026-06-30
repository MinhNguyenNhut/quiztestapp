import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Fade,
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  InputLabel,
  FormHelperText,
  Checkbox,
  FormControlLabel as CheckboxFormControlLabel,
} from '@mui/material';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import type { UseFormRegister, FieldError } from 'react-hook-form';
import {
  QuizOverviewCard,
  StartExamButton,
} from '../components/candidate-info';
import type {
  QuizOverview,
  CandidateFieldsConfig,
  CandidateFormValues,
  CandidateField,
} from '../types/candidate';

interface CandidateInfoPageProps {
  quiz: QuizOverview;
  fieldsConfig: CandidateFieldsConfig;
  onStartQuiz: (candidateData: CandidateFormValues) => void;
  isLoading?: boolean;
}

/**
 * CandidateInfoPage displays quiz overview and candidate information form
 * before starting the exam. Fully responsive with animations.
 */
export default function CandidateInfoPage({
  quiz,
  fieldsConfig,
  onStartQuiz,
  isLoading = false,
}: CandidateInfoPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<CandidateFormValues>({
    mode: 'onBlur',
    defaultValues: fieldsConfig.fields.reduce((acc, field) => {
      acc[field.id] = field.type === 'checkbox' ? false : '';
      return acc;
    }, {} as CandidateFormValues),
  });

  const { handleSubmit } = methods;

  const handleFormSubmit = async (data: CandidateFormValues) => {
    setIsSubmitting(true);
    try {
      await onStartQuiz(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="lg">
        <Fade in timeout={600}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              align="center"
              sx={{
                mb: 4,
                fontWeight: 700,
                color: 'primary.main',
                display: { xs: 'none', md: 'block' },
              }}
            >
              Candidate Information
            </Typography>

            <Grid container spacing={3}>
              {/* Quiz Overview Card */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Fade in timeout={800}>
                  <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
                    <QuizOverviewCard quiz={quiz} />
                  </Box>
                </Fade>
              </Grid>

              {/* Candidate Form Card */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Fade in timeout={1000}>
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      boxShadow: '0 4px 24px -4px rgb(0 0 0 / 0.08)',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        display: { xs: 'block', md: 'none' },
                      }}
                    >
                      Candidate Information
                    </Typography>

                    <FormProvider {...methods}>
                      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                        <CandidateFormFields
                          fieldsConfig={fieldsConfig}
                          isLoading={isLoading}
                        />

                        <StartExamButton
                          handleSubmit={handleSubmit}
                          onSubmit={handleFormSubmit}
                          isSubmitting={isSubmitting}
                        />
                      </form>
                    </FormProvider>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}

/**
 * CandidateFormFields renders the dynamic form fields
 */
interface CandidateFormFieldsProps {
  fieldsConfig: CandidateFieldsConfig;
  isLoading?: boolean;
}

function CandidateFormFields({ fieldsConfig, isLoading }: CandidateFormFieldsProps) {
  const { fields, sections } = fieldsConfig;
  const { register, watch, setValue, formState: { errors } } = useFormContext<CandidateFormValues>();

  const groupedFields = sections?.length
    ? sections.map((section) => ({
        ...section,
        fields: fields
          .filter((f) => f.section === section.id)
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }))
    : [{ id: 'default', title: 'Candidate Information', fields: fields }];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ height: 60, borderRadius: 1, bgcolor: 'grey.200' }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {groupedFields.map((section) => (
        <Box key={section.id} sx={{ mb: 3 }}>
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

          <Grid container spacing={2}>
            {section.fields.map((field) => (
              <Grid
                size={{ xs: 12, sm: field.type === 'textarea' ? 12 : 6 }}
                key={field.id}
              >
                <FieldRenderer
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
    </Box>
  );
}

/**
 * FieldRenderer renders individual form fields based on type
 */
interface FieldRendererProps {
  field: CandidateField;
  register: UseFormRegister<CandidateFormValues>;
  watch: ReturnType<typeof useForm<CandidateFormValues>>['watch'];
  setValue: ReturnType<typeof useForm<CandidateFormValues>>['setValue'];
  error?: FieldError;
}

function FieldRenderer({ field, register, watch, setValue, error }: FieldRendererProps) {
  const { id, type, label, placeholder, required, options, validation } = field;
  const hasError = !!error;
  const errorMessage = error?.message as string | undefined;

  const commonProps = {
    fullWidth: true,
    margin: 'normal' as const,
    label: label,
    placeholder: placeholder,
    error: hasError,
    helperText: errorMessage,
    required: required,
    InputLabelProps: { shrink: true },
  };

  const getValidationRules = () => {
    const rules: Record<string, unknown> = {};

    if (required) {
      rules.required = validation?.customMessage || `${label} is required`;
    }

    if (type === 'email') {
      rules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address',
      };
    }

    if (type === 'phone') {
      rules.pattern = {
        value: /^[\d\s\-+()]*$/,
        message: 'Please enter a valid phone number',
      };
    }

    if (validation?.minLength && type !== 'number') {
      rules.minLength = {
        value: validation.minLength,
        message: `Minimum ${validation.minLength} characters required`,
      };
    }

    if (validation?.maxLength && type !== 'number') {
      rules.maxLength = {
        value: validation.maxLength,
        message: `Maximum ${validation.maxLength} characters allowed`,
      };
    }

    return rules;
  };

  switch (type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'date':
    case 'number':
      return (
        <TextField
          {...commonProps}
          type={type === 'phone' ? 'tel' : type}
          {...register(id, getValidationRules())}
        />
      );

    case 'textarea':
      return (
        <TextField
          {...commonProps}
          multiline
          rows={4}
          {...register(id, getValidationRules())}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth error={hasError} margin="normal" required={required}>
          <InputLabel id={`${id}-label`}>{label}</InputLabel>
          <Select
            labelId={`${id}-label`}
            label={label}
            {...register(id, getValidationRules())}
          >
            {options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
      );

    case 'radio':
      return (
        <FormControl component="fieldset" fullWidth margin="normal" error={hasError} required={required}>
          <FormLabel component="legend" id={`${id}-label`}>
            {label}
          </FormLabel>
          <RadioGroup
            aria-labelledby={`${id}-label`}
            {...register(id, getValidationRules())}
          >
            {options?.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl fullWidth margin="normal" error={hasError}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              {...register(id)}
              checked={watch(id) === true}
              onChange={(e) => setValue(id, e.target.checked)}
            />
            <CheckboxFormControlLabel
              control={<></>}
              label={
                <Box component="span">
                  {required && (
                    <Box component="span" sx={{ color: 'error.main', mr: 0.5 }}>
                      *
                    </Box>
                  )}
                  {label}
                </Box>
              }
            />
          </Box>
          {errorMessage && <FormHelperText sx={{ ml: 4 }}>{errorMessage}</FormHelperText>}
        </FormControl>
      );

    default:
      return (
        <TextField
          {...commonProps}
          {...register(id, getValidationRules())}
        />
      );
  }
}