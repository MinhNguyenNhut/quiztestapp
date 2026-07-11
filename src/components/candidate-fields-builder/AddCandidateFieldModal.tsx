import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import type {
  CandidateField,
  CandidateFieldSection,
  FieldVisibilityRule,
} from '../../types/candidate';
import FieldBasicsForm from './FieldBasicsForm';
import FieldOptionsEditor from './FieldOptionsEditor';
import FieldValidationEditor from './FieldValidationEditor';
import FieldVisibilityEditor from './FieldVisibilityEditor';

interface AddCandidateFieldModalProps {
  open: boolean;
  field: CandidateField | null;
  sections: CandidateFieldSection[];
  allFields: CandidateField[];
  nextOrder: number;
  onClose: () => void;
  onSubmit: (field: CandidateField) => void;
}

const emptyTemplate = (order: number, sections: CandidateFieldSection[]): CandidateField => ({
  id: uuidv4(),
  type: 'text',
  label: '',
  required: false,
  order,
  section: sections[0]?.id,
});

export default function AddCandidateFieldModal({
  open,
  field,
  sections,
  allFields,
  nextOrder,
  onClose,
  onSubmit,
}: AddCandidateFieldModalProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CandidateField>(() => emptyTemplate(nextOrder, sections));

  useEffect(() => {
    if (open) {
      setDraft(field ?? emptyTemplate(nextOrder, sections));
    }
  }, [open, field, nextOrder, sections]);

  const update = (patch: Partial<CandidateField>) => setDraft((d) => ({ ...d, ...patch }));

  const supportsOptions = draft.type === 'select' || draft.type === 'radio';
  const supportsValidation =
    draft.type === 'text' || draft.type === 'email' || draft.type === 'phone' || draft.type === 'number';

  const handleSubmit = () => {
    if (!draft.label.trim()) return;
    onSubmit({ ...draft, order: draft.order ?? nextOrder });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle component="div">
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
          {field ? t('candidateFieldsBuilder.editField') : t('candidateFieldsBuilder.addField')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t('candidateFieldsBuilder.configureFieldDesc')}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <Stack spacing={2}>
          <FieldBasicsForm field={draft} sections={sections} onChange={update} />

          {supportsOptions && (
            <FieldOptionsEditor
              options={draft.options ?? []}
              onChange={(options) => update({ options })}
            />
          )}

          {supportsValidation && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('candidateFieldsBuilder.validation')}
              </Typography>
              <FieldValidationEditor field={draft} onChange={(validation) => update({ validation })} />
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {t('candidateFieldsBuilder.conditionalVisibility')}
            </Typography>
            <FieldVisibilityEditor
              allFields={allFields}
              currentField={draft}
              rule={draft.visibleIf}
              onChange={(rule: FieldVisibilityRule | undefined) => update({ visibleIf: rule })}
            />
          </Box>

          {draft.type === 'checkbox' && (
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(draft.defaultValue)}
                  onChange={(e) => update({ defaultValue: e.target.checked })}
                />
              }
              label={t('candidateFieldsBuilder.checkedByDefault')}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!draft.label.trim()}>
          {field ? t('common.save') : t('candidateFieldsBuilder.addField')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
