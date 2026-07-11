import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';
import type { CandidateFieldOption } from '../../types/candidate';

interface FieldOptionsEditorProps {
  options: CandidateFieldOption[];
  onChange: (options: CandidateFieldOption[]) => void;
}

/**
 * Editor for `CandidateField.options`, used by `select` and `radio`
 * fields. Each row has a label (display) and a value (stored). The
 * "Add option" button appends a new row with a fresh UUID as the
 * value.
 */
export default function FieldOptionsEditor({ options, onChange }: FieldOptionsEditorProps) {
  const { t } = useTranslation();

  const updateOption = (index: number, patch: Partial<CandidateFieldOption>) => {
    const next = [...options];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const addOption = () => {
    onChange([...options, { label: '', value: uuidv4() }]);
  };

  const removeOption = (index: number) => {
    const next = [...options];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {t('candidateFieldsBuilder.options')}
      </Typography>
      <Stack spacing={1}>
        {options.map((opt, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              label={t('candidateFieldsBuilder.label')}
              value={opt.label}
              onChange={(e) => updateOption(i, { label: e.target.value })}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              label={t('candidateFieldsBuilder.optionValue')}
              value={opt.value}
              onChange={(e) => updateOption(i, { value: e.target.value })}
              sx={{ flex: 1 }}
            />
            <IconButton size="small" color="error" onClick={() => removeOption(i)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} size="small" onClick={addOption} sx={{ alignSelf: 'flex-start' }}>
          {t('candidateFieldsBuilder.addOption')}
        </Button>
      </Stack>
    </Box>
  );
}
