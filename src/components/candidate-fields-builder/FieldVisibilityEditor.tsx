import { FormControl, InputLabel, MenuItem, Select, TextField, Typography, Stack, Button } from '@mui/material';
import type { CandidateField, FieldVisibilityRule } from '../../types/candidate';

interface FieldVisibilityEditorProps {
  /** All fields in the form, in display order. */
  allFields: CandidateField[];
  /** The current field being edited (used to filter out fields that come
   *  after it, so we never offer a self-reference or a circular rule). */
  currentField: CandidateField;
  rule: FieldVisibilityRule | undefined;
  onChange: (rule: FieldVisibilityRule | undefined) => void;
}

/**
 * Conditional-visibility editor. The user can only reference fields
 * whose `order` is strictly less than the current field's — preventing
 * the obvious circularity (a field depending on a field defined after
 * it). The rule is unset by clicking "Clear rule".
 */
export default function FieldVisibilityEditor({
  allFields,
  currentField,
  rule,
  onChange,
}: FieldVisibilityEditorProps) {
  const candidates = allFields.filter((f) => f.id !== currentField.id && (f.order ?? 0) < (currentField.order ?? 0));

  if (candidates.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No earlier fields available — add another field above this one to define a visibility rule.
      </Typography>
    );
  }

  const update = (patch: Partial<FieldVisibilityRule>) => {
    if (!rule) return;
    onChange({ ...rule, ...patch });
  };

  return (
    <Stack spacing={1.5}>
      <FormControl size="small" fullWidth>
        <InputLabel>Show only when</InputLabel>
        <Select
          label="Show only when"
          value={rule?.fieldId ?? ''}
          onChange={(e) => {
            const fieldId = e.target.value as string;
            onChange({ fieldId, equals: '' });
          }}
        >
          {candidates.map((f) => (
            <MenuItem key={f.id} value={f.id}>
              {f.label || f.id}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {rule && (
        <TextField
          label="Equals value"
          size="small"
          value={String(rule.equals)}
          onChange={(e) => update({ equals: e.target.value })}
          fullWidth
          helperText="The trigger field must equal this value for this field to be shown."
        />
      )}

      {rule && (
        <Button size="small" color="inherit" onClick={() => onChange(undefined)} sx={{ alignSelf: 'flex-start' }}>
          Clear rule
        </Button>
      )}
    </Stack>
  );
}
