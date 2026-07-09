import { Box, Stack, TextField, Typography } from '@mui/material';
import type { CandidateField } from '../../types/candidate';

interface FieldValidationEditorProps {
  field: CandidateField;
  onChange: (validation: CandidateField['validation']) => void;
}

const supportsText = (type: CandidateField['type']): boolean =>
  type === 'text' || type === 'email' || type === 'phone' || type === 'textarea';
const supportsNumber = (type: CandidateField['type']): boolean => type === 'number';
const supportsPattern = (type: CandidateField['type']): boolean =>
  type === 'text' || type === 'email' || type === 'phone';

/**
 * Inline editor for the `validation` block on a `CandidateField`. Only
 * the controls relevant to the current `type` are shown. Any change
 * re-emits the whole validation object so partial edits stay clean.
 */
export default function FieldValidationEditor({ field, onChange }: FieldValidationEditorProps) {
  const v = field.validation ?? {};
  const update = (patch: Partial<NonNullable<CandidateField['validation']>>) => {
    onChange({ ...v, ...patch });
  };

  if (!supportsText(field.type) && !supportsNumber(field.type)) {
    return (
      <Typography variant="caption" color="text.secondary">
        No validation options for this field type.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {supportsText(field.type) && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label="Min length"
            type="number"
            size="small"
            value={v.minLength ?? ''}
            onChange={(e) => update({ minLength: e.target.value === '' ? undefined : Number(e.target.value) })}
            slotProps={{ htmlInput: { min: 0 } }}
            fullWidth
          />
          <TextField
            label="Max length"
            type="number"
            size="small"
            value={v.maxLength ?? ''}
            onChange={(e) => update({ maxLength: e.target.value === '' ? undefined : Number(e.target.value) })}
            slotProps={{ htmlInput: { min: 0 } }}
            fullWidth
          />
        </Box>
      )}

      {supportsNumber(field.type) && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label="Min value"
            type="number"
            size="small"
            value={v.min ?? ''}
            onChange={(e) => update({ min: e.target.value === '' ? undefined : Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Max value"
            type="number"
            size="small"
            value={v.max ?? ''}
            onChange={(e) => update({ max: e.target.value === '' ? undefined : Number(e.target.value) })}
            fullWidth
          />
        </Box>
      )}

      {supportsPattern(field.type) && (
        <TextField
          label="Regex pattern"
          size="small"
          value={v.pattern ?? ''}
          onChange={(e) => update({ pattern: e.target.value || undefined })}
          placeholder="e.g. ^[A-Z]{2}\\d{4}$"
          fullWidth
          helperText="JavaScript regex applied on submit"
        />
      )}

      <TextField
        label="Custom error message"
        size="small"
        value={v.customMessage ?? ''}
        onChange={(e) => update({ customMessage: e.target.value || undefined })}
        fullWidth
      />
    </Stack>
  );
}
