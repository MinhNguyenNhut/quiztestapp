import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import FunctionsIcon from '@mui/icons-material/Functions';

interface FormulaModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (latex: string) => void;
}

export default function FormulaModal({ open, onClose, onInsert }: FormulaModalProps) {
  const [latex, setLatex] = useState('');

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert(latex.trim());
      setLatex('');
      onClose();
    }
  };

  const handleClose = () => {
    setLatex('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FunctionsIcon color="primary" />
        Insert Math Formula
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
          Enter LaTeX math formula below. A preview will be shown in real time.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={4}
          placeholder="\\frac{a+b}{c}"
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          variant="outlined"
          sx={{ fontFamily: 'monospace' }}
        />
        {latex.trim() && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Preview:
            </Typography>
            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                p: 1.5,
                bgcolor: 'white',
                borderRadius: 1,
                border: '1px solid #e2e8f0',
                overflowX: 'auto',
              }}
            >
              {latex}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleInsert} disabled={!latex.trim()}>
          Insert
        </Button>
      </DialogActions>
    </Dialog>
  );
}
