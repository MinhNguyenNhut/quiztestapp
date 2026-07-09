import { useCallback, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAppDispatch } from '../../features/quiz/store';
import { updateCandidateFieldsConfig } from '../../features/quiz/quizSlice';
import { useAlert } from '../../hooks/useAlert';
import AppAlert from '../common/AppAlert/AppAlert';
import type {
  CandidateField,
  CandidateFieldSection,
  CandidateFieldsConfig,
} from '../../types/candidate';
import CandidateFieldList from './CandidateFieldList';
import CandidateFieldSectionManager from './CandidateFieldSectionManager';
import AddCandidateFieldModal from './AddCandidateFieldModal';

interface CandidateFieldsBuilderProps {
  quizId: string;
  defaultConfig: CandidateFieldsConfig;
}

const sortByOrder = (items: CandidateField[]): CandidateField[] =>
  [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const renumber = (items: CandidateField[]): CandidateField[] =>
  items.map((f, i) => ({ ...f, order: i + 1 }));

/**
 * Form-owning parent for the candidate-fields editor. Holds the working
 * `CandidateFieldsConfig` in local state, exposes a "Save" button that
 * dispatches `updateCandidateFieldsConfig`, and a "Manage sections"
 * button that opens a section manager dialog. Mirrors `QuestionBuilder`'s
 * split-pane shape (list left, editor right).
 */
export default function CandidateFieldsBuilder({ quizId, defaultConfig }: CandidateFieldsBuilderProps) {
  const dispatch = useAppDispatch();
  const { alert, showAlert, closeAlert } = useAlert();

  const [fields, setFields] = useState<CandidateField[]>(() => sortByOrder(defaultConfig.fields));
  const [sections, setSections] = useState<CandidateFieldSection[]>(() =>
    [...(defaultConfig.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [editingField, setEditingField] = useState<CandidateField | null>(null);

  const nextOrder = useMemo(
    () => fields.reduce((max, f) => Math.max(max, f.order ?? 0), 0) + 1,
    [fields]
  );

  const handleAddField = useCallback(() => {
    setEditingField(null);
    setModalOpen(true);
  }, []);

  const handleSelectField = useCallback(
    (id: string) => {
      const f = fields.find((x) => x.id === id);
      if (!f) return;
      setSelectedId(id);
      setEditingField(f);
      setModalOpen(true);
    },
    [fields]
  );

  const handleSubmitField = useCallback(
    (field: CandidateField) => {
      setFields((prev) => {
        const idx = prev.findIndex((f) => f.id === field.id);
        if (idx === -1) {
          return renumber([...prev, field]);
        }
        const next = [...prev];
        next[idx] = field;
        return renumber(next);
      });
      setSelectedId(field.id);
    },
    []
  );

  const handleDeleteField = useCallback(
    (id: string) => {
      setFields((prev) => renumber(prev.filter((f) => f.id !== id)));
      if (selectedId === id) {
        setSelectedId(null);
        setEditingField(null);
      }
    },
    [selectedId]
  );

  const handleReorder = useCallback((from: number, to: number) => {
    setFields((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return renumber(next);
    });
  }, []);

  const handleSave = useCallback(() => {
    const config: CandidateFieldsConfig = {
      fields: renumber(fields),
      sections: sections.length > 0 ? sections : undefined,
    };
    dispatch(updateCandidateFieldsConfig({ quizId, config }));
    showAlert('Candidate fields saved', 'success');
  }, [dispatch, fields, sections, quizId, showAlert]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CandidateFieldList
            fields={fields}
            sections={sections}
            onSelect={handleSelectField}
            onReorder={handleReorder}
            onDelete={handleDeleteField}
          />
          <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddField}
            >
              Add Field
            </Button>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3 }}>
          <Stack spacing={3} sx={{ maxWidth: 720 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Candidate Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure the fields that the candidate fills in before the exam starts. The form
                shown on <code>/quiz/:id/candidate</code> is generated from this list.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddField}>
                Add Field
              </Button>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setSectionsOpen(true)}
              >
                Manage Sections
              </Button>
              <Button variant="contained" color="success" onClick={handleSave} sx={{ ml: 'auto' }}>
                Save Fields
              </Button>
            </Stack>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Fields ({fields.length})
              </Typography>
              {fields.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No fields yet. Click "Add Field" to define one.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {fields.map((f) => (
                    <Box
                      key={f.id}
                      onClick={() => handleSelectField(f.id)}
                      sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f9fafb' },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {f.label || '(untitled)'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {f.type}
                        {f.section ? ` · ${sections.find((s) => s.id === f.section)?.title ?? f.section}` : ''}
                        {f.required ? ' · required' : ''}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Box>

      <AddCandidateFieldModal
        open={modalOpen}
        field={editingField}
        sections={sections}
        allFields={fields}
        nextOrder={nextOrder}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitField}
      />

      <Dialog open={sectionsOpen} onClose={() => setSectionsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle component="div">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Manage Sections
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sections group fields on the candidate form.
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CandidateFieldSectionManager sections={sections} onChange={setSections} />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSectionsOpen(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      <AppAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={closeAlert}
      />
    </Box>
  );
}
