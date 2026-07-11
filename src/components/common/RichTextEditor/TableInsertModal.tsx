import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import TableChartIcon from '@mui/icons-material/TableChart';

interface TableInsertModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
}

export default function TableInsertModal({ open, onClose, onInsert }: TableInsertModalProps) {
  const { t } = useTranslation();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleInsert = () => {
    onInsert(Math.min(Math.max(rows, 1), 10), Math.min(Math.max(cols, 1), 10));
    setRows(3);
    setCols(3);
    onClose();
  };

  const handleClose = () => {
    setRows(3);
    setCols(3);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TableChartIcon color="primary" />
        {t('richTextEditor.tableModal.title')}
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label={t('richTextEditor.tableModal.rows')}
            type="number"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: 10 } }}
            size="small"
            sx={{ width: 100 }}
          />
          <TextField
            label={t('richTextEditor.tableModal.columns')}
            type="number"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            slotProps={{ htmlInput: { min: 1, max: 10 } }}
            size="small"
            sx={{ width: 100 }}
          />
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            {t('richTextEditor.tableModal.preview', { rows, cols })}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(cols, 10)}, 24px)`,
              gap: '2px',
            }}
          >
            {Array.from({ length: Math.min(rows * cols, 100) }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: 'primary.main',
                  borderRadius: '3px',
                  opacity: 0.85,
                }}
              />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={handleInsert}>
          {t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
