import { useState, type KeyboardEvent } from 'react';
import { Box, IconButton, Menu, MenuItem, TextField, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_FONT_SIZE,
  FONT_SIZE_PRESETS,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from './fontOptions.ts';

interface FontSizeInputProps {
  /** Size at the caret, e.g. "16px" or "15.2px". Empty string when unknown. */
  value: string;
  /** Called with the new size in px (already clamped). */
  onChange: (px: number) => void;
  /** Called on mousedown over the text field — fires BEFORE the browser moves
   * the document selection out of the editor, letting it snapshot the current
   * selection so it can be restored when the size is applied (Enter key). */
  onFieldMouseDown?: () => void;
}

function parseSize(value: string): number | null {
  const n = parseFloat(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

const clamp = (n: number) => Math.min(Math.max(n, MIN_FONT_SIZE), MAX_FONT_SIZE);

export default function FontSizeInput({ value, onChange, onFieldMouseDown }: FontSizeInputProps) {
  const { t } = useTranslation();
  const current = parseSize(value);
  // Text the user is typing. null = show the size at the caret (derived, no effect).
  const [draft, setDraft] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const display = draft ?? (current !== null ? String(current) : '');

  const apply = (px: number) => {
    setDraft(null);
    onChange(clamp(px));
  };

  const base = () => {
    if (draft) {
      const n = parseInt(draft, 10);
      if (!Number.isNaN(n)) return n;
    }
    return current ?? DEFAULT_FONT_SIZE;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const n = parseInt(draft ?? '', 10);
      if (!Number.isNaN(n)) apply(n);
      else setDraft(null);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      apply(base() + (e.key === 'ArrowUp' ? 1 : -1));
    } else if (e.key === 'Escape') {
      setDraft(null);
    }
  };

  const keepEditorFocus = (e: React.MouseEvent) => e.preventDefault();

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', mr: 0.5 }}>
      <Tooltip title={t('richTextEditor.toolbar.fontSizeDecrease', 'Decrease font size')}>
        <IconButton
          size="small"
          onMouseDown={keepEditorFocus}
          onClick={() => apply(base() - 1)}
          aria-label={t('richTextEditor.toolbar.fontSizeDecrease', 'Decrease font size')}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <TextField
        size="small"
        value={display}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 3))}
        onKeyDown={handleKeyDown}
        onBlur={() => setDraft(null)}
        slotProps={{
          htmlInput: {
            // NOTE: deliberately NOT preventDefault() — the field must take
            // focus so the user can type a size. We only snapshot the editor
            // selection before the browser moves it into this input.
            onMouseDown: () => onFieldMouseDown?.(),
            inputMode: 'numeric',
            'aria-label': t('richTextEditor.toolbar.fontSizeInput', 'Font size'),
          },
        }}
        sx={{ width: 52, '& input': { textAlign: 'center', px: 0.5 } }}
      />

      <Tooltip title={t('richTextEditor.toolbar.fontSizeIncrease', 'Increase font size')}>
        <IconButton
          size="small"
          onMouseDown={keepEditorFocus}
          onClick={() => apply(base() + 1)}
          aria-label={t('richTextEditor.toolbar.fontSizeIncrease', 'Increase font size')}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title={t('richTextEditor.toolbar.fontSizePresets', 'Choose font size')}>
        <IconButton
          size="small"
          onMouseDown={keepEditorFocus}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          aria-label={t('richTextEditor.toolbar.fontSizePresets', 'Choose font size')}
        >
          <ArrowDropDownIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        disableRestoreFocus
        slotProps={{ paper: { sx: { maxHeight: 320 } } }}
      >
        {FONT_SIZE_PRESETS.map((n) => (
          <MenuItem
            key={n}
            selected={n === current}
            onClick={() => {
              setMenuAnchor(null);
              apply(n);
            }}
          >
            {n}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}