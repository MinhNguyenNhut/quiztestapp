import { useState, useRef, type ChangeEvent } from 'react';
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
import { useTranslation } from 'react-i18next';
import ImageIcon from '@mui/icons-material/Image';

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}

export default function ImageUploadModal({ open, onClose, onInsert }: ImageUploadModalProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInsert = () => {
    if (previewUrl.trim()) {
      onInsert(previewUrl.trim(), alt.trim());
      reset();
      onClose();
    }
  };

  const reset = () => {
    setUrl('');
    setAlt('');
    setPreviewUrl('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setPreviewUrl(value);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setUrl(objectUrl);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ImageIcon color="primary" />
        {t('richTextEditor.imageModal.title')}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
          {t('richTextEditor.imageModal.description')}
        </Typography>
        <TextField
          autoFocus
          fullWidth
          label={t('richTextEditor.imageModal.urlLabel')}
          placeholder={t('richTextEditor.imageModal.urlPlaceholder')}
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Box
          sx={{
            border: '2px dashed #d1d5db',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: '#f9fafb',
            '&:hover': { borderColor: 'primary.main', bgcolor: '#eef2ff' },
            mb: 2,
          }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
          }}
          aria-label={t('richTextEditor.imageModal.uploadAria')}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileSelect}
          />
          <Typography color="text.secondary" variant="body2">
            {t('richTextEditor.imageModal.uploadHint')}
          </Typography>
          <Typography color="text.disabled" variant="caption">
            {t('richTextEditor.imageModal.uploadFileTypes')}
          </Typography>
        </Box>
        <TextField
          fullWidth
          label={t('richTextEditor.imageModal.altLabel')}
          placeholder={t('richTextEditor.imageModal.altPlaceholder')}
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          variant="outlined"
          size="small"
        />
        {previewUrl && (
          <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
            <img
              src={previewUrl}
              alt={t('richTextEditor.imageModal.previewAlt')}
              style={{ maxWidth: '100%', maxHeight: 200, display: 'block', margin: '0 auto' }}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button variant="contained" onClick={handleInsert} disabled={!previewUrl.trim()}>
          {t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
