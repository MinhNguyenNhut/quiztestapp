import { FormControl, InputLabel, MenuItem, Select, TextField, Typography, Stack, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { CandidateField, FieldVisibilityRule } from '../../types/candidate';

interface FieldVisibilityEditorProps {
  allFields: CandidateField[];
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
  const { t } = useTranslation();
  const candidates = allFields.filter((f) => f.id !== currentField.id && (f.order ?? 0) < (currentField.order ?? 0));

  if (candidates.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {t('candidateFieldsBuilder.noEarlierFields')}
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
        <InputLabel>{t('candidateFieldsBuilder.showOnlyWhen')}</InputLabel>
        <Select
          label={t('candidateFieldsBuilder.showOnlyWhen')}
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
          label={t('candidateFieldsBuilder.equalsValue')}
          size="small"
          value={String(rule.equals)}
          onChange={(e) => update({ equals: e.target.value })}
          fullWidth
          helperText={t('candidateFieldsBuilder.equalsHelper')}
        />
      )}

      {rule && (
        <Button size="small" color="inherit" onClick={() => onChange(undefined)} sx={{ alignSelf: 'flex-start' }}>
          {t('candidateFieldsBuilder.clearRule')}
        </Button>
      )}
    </Stack>
  );
}
