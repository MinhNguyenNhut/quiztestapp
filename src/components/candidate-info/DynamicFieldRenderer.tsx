/**
 * DynamicFieldRenderer renders form fields based on their type
 * configuration. Supports text, email, phone, select, radio, checkbox,
 * textarea, date, and number inputs — entirely driven by the
 * `CandidateField` config. No field is hard-coded; renderers are
 * selected by a switch on `field.type`.
 */
import {
  TextField,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormHelperText,
  Box,
  Select,
  InputLabel,
  FormControlLabel as CheckboxFormControlLabel,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { UseFormRegister, FieldError } from 'react-hook-form';
import type { CandidateField, CandidateFormValues } from '../../types/candidate';

interface DynamicFieldRendererProps {
  field: CandidateField;
  register: UseFormRegister<CandidateFormValues>;
  watch: ReturnType<typeof import('react-hook-form').useForm<CandidateFormValues>>['watch'];
  setValue: ReturnType<typeof import('react-hook-form').useForm<CandidateFormValues>>['setValue'];
  error?: FieldError;
}

export default function DynamicFieldRenderer({
  field,
  register,
  watch,
  setValue,
  error,
}: DynamicFieldRendererProps) {
  const { t } = useTranslation();
  const {
    id,
    type,
    label,
    placeholder,
    required,
    options,
    validation,
    defaultValue,
    helpText,
  } = field;
  const hasError = !!error;
  const errorMessage = error?.message;
  const helper = errorMessage ?? helpText;

  const commonProps = {
    fullWidth: true,
    margin: 'normal' as const,
    label,
    placeholder,
    error: hasError,
    helperText: helper,
    required,
    defaultValue: defaultValue as string | number | undefined,
    slotProps: {
      inputLabel: {
        shrink: true,
      },
    },
  };

  const getValidationRules = () => {
    const rules: Record<string, unknown> = {};

    if (required) {
      rules.required = validation?.customMessage || t('validation.requiredField', { label });
    }

    if (type === 'email') {
      rules.pattern = {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: t('validation.invalidEmail'),
      };
    }

    if (type === 'phone') {
      rules.pattern = {
        value: /^[\d\s\-+()]*$/,
        message: t('validation.invalidPhone'),
      };
    }

    if (type === 'number') {
      if (validation?.min !== undefined) rules.min = { value: validation.min, message: t('validation.minValue', { min: validation.min }) };
      if (validation?.max !== undefined) rules.max = { value: validation.max, message: t('validation.maxValue', { max: validation.max }) };
    }

    if (validation?.minLength && type !== 'number') {
      rules.minLength = {
        value: validation.minLength,
        message: t('validation.minLength', { count: validation.minLength }),
      };
    }

    if (validation?.maxLength && type !== 'number') {
      rules.maxLength = {
        value: validation.maxLength,
        message: t('validation.maxLength', { count: validation.maxLength }),
      };
    }

    if (validation?.pattern) {
      rules.pattern = {
        value: new RegExp(validation.pattern),
        message: validation.customMessage || t('validation.invalidFormat'),
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
            defaultValue={defaultValue as string | undefined}
            {...register(id, getValidationRules())}
          >
            {options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {helper && <FormHelperText>{helper}</FormHelperText>}
        </FormControl>
      );

    case 'radio':
      return (
        <FormControl
          component="fieldset"
          fullWidth
          margin="normal"
          error={hasError}
          required={required}
        >
          <FormLabel component="legend" id={`${id}-label`}>
            {label}
          </FormLabel>
          <RadioGroup
            aria-labelledby={`${id}-label`}
            defaultValue={defaultValue as string | undefined}
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
          {helper && <FormHelperText>{helper}</FormHelperText>}
        </FormControl>
      );

    case 'checkbox': {
      const requiredHelp =
        required && !watch(id) ? t('validation.requiredField', { label }) : null;
      return (
        <FormControl fullWidth margin="normal" error={hasError}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Checkbox
              {...register(id)}
              defaultChecked={Boolean(defaultValue)}
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
          {(errorMessage || requiredHelp) && (
            <FormHelperText sx={{ ml: 4 }}>
              {errorMessage || requiredHelp}
            </FormHelperText>
          )}
          {!errorMessage && helpText && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
              {helpText}
            </Typography>
          )}
        </FormControl>
      );
    }

    default:
      return (
        <TextField
          {...commonProps}
          {...register(id, getValidationRules())}
        />
      );
  }
}
