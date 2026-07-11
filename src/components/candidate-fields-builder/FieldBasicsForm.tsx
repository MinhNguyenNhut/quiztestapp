import { FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type {
  CandidateField,
  CandidateFieldSection,
  CandidateFieldType,
} from '../../types/candidate';
import { FIELD_TYPE_LABELS } from '../../types/candidate';

const ALL_TYPES: CandidateFieldType[] = [
  'text',
  'email',
  'phone',
  'number',
  'date',
  'textarea',
  'select',
  'radio',
  'checkbox',
];

interface FieldBasicsFormProps {
  field: CandidateField;
  sections: CandidateFieldSection[];
  onChange: (patch: Partial<CandidateField>) => void;
}

/**
 * Top half of the field modal: type, section, label, placeholder, help
 * text, default value, and the required toggle. The type is the
 * single switch that drives which other controls appear below.
 */
export default function FieldBasicsForm({ field, sections, onChange }: FieldBasicsFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('candidateFieldsBuilder.fieldType')}</InputLabel>
            <Select
              label={t('candidateFieldsBuilder.fieldType')}
              value={field.type}
              onChange={(e) => onChange({ type: e.target.value as CandidateFieldType })}
            >
              {ALL_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {FIELD_TYPE_LABELS[type]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('candidateFieldsBuilder.section')}</InputLabel>
            <Select
              label={t('candidateFieldsBuilder.section')}
              value={field.section ?? ''}
              onChange={(e) => onChange({ section: (e.target.value as string) || undefined })}
            >
              <MenuItem value="">{t('candidateFieldsBuilder.noneOption')}</MenuItem>
              {sections.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TextField
        label={t('candidateFieldsBuilder.label')}
        size="small"
        value={field.label}
        onChange={(e) => onChange({ label: e.target.value })}
        fullWidth
        required
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t('candidateFieldsBuilder.placeholder')}
            size="small"
            value={field.placeholder ?? ''}
            onChange={(e) => onChange({ placeholder: e.target.value || undefined })}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label={t('candidateFieldsBuilder.helpText')}
            size="small"
            value={field.helpText ?? ''}
            onChange={(e) => onChange({ helpText: e.target.value || undefined })}
            fullWidth
          />
        </Grid>
      </Grid>

      <TextField
        label={t('candidateFieldsBuilder.defaultValue')}
        size="small"
        value={String(field.defaultValue ?? '')}
        onChange={(e) => onChange({ defaultValue: e.target.value || undefined })}
        fullWidth
      />

      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={Boolean(field.required)}
            onChange={(e) => onChange({ required: e.target.checked })}
          />
        }
        label={t('candidate.required')}
      />
    </>
  );
}
