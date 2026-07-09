import { useEffect, useState } from 'react';
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
  /** When set, the modal edits this field instead of creating a new one. */
  field: CandidateField | null;
  sections: CandidateFieldSection[];
  /** All fields in the form — used by the visibility editor. */
  allFields: CandidateField[];
  /** Suggested next `order` when creating a new field. */
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
          {field ? 'Edit Field' : 'Add Field'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Configure how this field appears on the candidate form
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
                Validation
              </Typography>
              <FieldValidationEditor field={draft} onChange={(validation) => update({ validation })} />
            </Box>
          )}

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Conditional visibility
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
              label="Checked by default"
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!draft.label.trim()}>
          {field ? 'Save' : 'Add Field'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
