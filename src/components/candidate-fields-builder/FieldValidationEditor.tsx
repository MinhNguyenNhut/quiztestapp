import { useMemo } from 'react';
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
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

// Human-friendly presets mapped to real regex under the hood. No raw regex
// is ever exposed to the user — if a new format is needed, add a preset here.
const PATTERN_PRESETS: { value: string; pattern: string | null }[] = [
  { value: 'none', pattern: null },
  { value: 'lettersOnly', pattern: '^[A-Za-zÀ-ỹ\\s]+$' },
  { value: 'numbersOnly', pattern: '^[0-9]+$' },
  { value: 'alphanumeric', pattern: '^[A-Za-z0-9]+$' },
  { value: 'noSpaces', pattern: '^\\S+$' },
  { value: 'vietnamesePhone', pattern: '^(0|\\+84)[0-9]{9,10}$' },
  { value: 'nationalId', pattern: '^[0-9]{9}([0-9]{3})?$' },
  { value: 'noSpecialChars', pattern: '^[A-Za-z0-9À-ỹ\\s]+$' },
];

// Reverse lookup: which preset does a stored pattern correspond to?
// If a field already has some other pattern (set before this change, or
// via a script), fall back to "No restriction" rather than showing regex.
const findPresetForPattern = (pattern: string | undefined): string => {
  if (!pattern) return 'none';
  const match = PATTERN_PRESETS.find((p) => p.pattern === pattern);
  return match ? match.value : 'none';
};

/**
 * Inline editor for the `validation` block on a `CandidateField`. Only
 * the controls relevant to the current `type` are shown. Any change
 * re-emits the whole validation object so partial edits stay clean.
 *
 * Pattern validation is a plain-language preset dropdown only — no
 * regex is ever shown to the user, since this app is used by non-
 * technical people. To support a new format, add a preset above.
 */
export default function FieldValidationEditor({ field, onChange }: FieldValidationEditorProps) {
  const { t } = useTranslation();
  const v = field.validation ?? {};

  const update = (patch: Partial<NonNullable<CandidateField['validation']>>) => {
    onChange({ ...v, ...patch });
  };

  const selectedPreset = findPresetForPattern(v.pattern);

  const handlePresetChange = (value: string) => {
    const preset = PATTERN_PRESETS.find((p) => p.value === value);
    update({ pattern: preset?.pattern ?? undefined });
  };

  const presetLabels: Record<string, string> = useMemo(
    () => ({
      none: t('candidateFieldsBuilder.patternPreset.none'),
      lettersOnly: t('candidateFieldsBuilder.patternPreset.lettersOnly'),
      numbersOnly: t('candidateFieldsBuilder.patternPreset.numbersOnly'),
      alphanumeric: t('candidateFieldsBuilder.patternPreset.alphanumeric'),
      noSpaces: t('candidateFieldsBuilder.patternPreset.noSpaces'),
      vietnamesePhone: t('candidateFieldsBuilder.patternPreset.vietnamesePhone'),
      nationalId: t('candidateFieldsBuilder.patternPreset.nationalId'),
      noSpecialChars: t('candidateFieldsBuilder.patternPreset.noSpecialChars'),
    }),
    [t],
  );

  if (!supportsText(field.type) && !supportsNumber(field.type)) {
    return (
      <Typography variant="caption" color="text.secondary">
        {t('candidateFieldsBuilder.noValidationOptions')}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {supportsText(field.type) && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            label={t('candidateFieldsBuilder.minLength')}
            type="number"
            size="small"
            value={v.minLength ?? ''}
            onChange={(e) => update({ minLength: e.target.value === '' ? undefined : Number(e.target.value) })}
            slotProps={{ htmlInput: { min: 0 } }}
            fullWidth
          />
          <TextField
            label={t('candidateFieldsBuilder.maxLength')}
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
            label={t('candidateFieldsBuilder.minValue')}
            type="number"
            size="small"
            value={v.min ?? ''}
            onChange={(e) => update({ min: e.target.value === '' ? undefined : Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label={t('candidateFieldsBuilder.maxValue')}
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
          select
          label={t('candidateFieldsBuilder.formatRule')}
          size="small"
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
          fullWidth
          helperText={t('candidateFieldsBuilder.formatRuleHelper')}
        >
          {PATTERN_PRESETS.map((preset) => (
            <MenuItem key={preset.value} value={preset.value}>
              {presetLabels[preset.value]}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        label={t('candidateFieldsBuilder.customErrorMessage')}
        size="small"
        value={v.customMessage ?? ''}
        onChange={(e) => update({ customMessage: e.target.value || undefined })}
        fullWidth
      />
    </Stack>
  );
}