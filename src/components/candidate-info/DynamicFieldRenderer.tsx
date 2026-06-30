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
} from '@mui/material';
import type { UseFormRegister, FieldError } from 'react-hook-form';
import type { CandidateField, CandidateFormValues } from '../../types/candidate';

interface DynamicFieldRendererProps {
  field: CandidateField;
  register: UseFormRegister<CandidateFormValues>;
  watch: ReturnType<typeof import('react-hook-form').useForm<CandidateFormValues>>['watch'];
  setValue: ReturnType<typeof import('react-hook-form').useForm<CandidateFormValues>>['setValue'];
  error?: FieldError;
}

/**
 * DynamicFieldRenderer renders form fields based on their type configuration
 * Supports: text, email, phone, select, radio, checkbox, textarea, date, number
 */
export default function DynamicFieldRenderer({
  field,
  register,
  watch,
  setValue,
  error,
}: DynamicFieldRendererProps) {
  const { id, type, label, placeholder, required, options, validation } = field;
  const hasError = !!error;
  const errorMessage = error?.message;

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

    if (type === 'number') {
      rules.min = validation?.minLength;
      rules.max = validation?.maxLength;
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

    if (validation?.pattern) {
      rules.pattern = {
        value: new RegExp(validation.pattern),
        message: validation.customMessage || 'Invalid format',
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