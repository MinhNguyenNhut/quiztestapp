import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

// 40 preset swatches covering the common text / highlight cases.
export const PRESET_COLORS: ReadonlyArray<string> = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#cc4125', '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7',
];

interface ColorPickerPopoverProps {
  /** Icon element rendered on the toolbar button (e.g. <FormatColorTextIcon />). */
  icon: React.ReactNode;
  /** Tooltip text for the toolbar button. */
  label: string;
  /** Apply a color. */
  onApply: (color: string) => void;
  /** Remove the color from the selection. */
  onRemove: () => void;
  /** Short label shown inside the popover header (e.g. "Text" or "Highlight"). */
  modeLabel: string;
  /** Color currently at the caret, in `#rrggbb` form. Used to mark the active swatch
   *  and seed the custom-color picker. */
  currentColor?: string;
}

export default function ColorPickerPopover({
  icon,
  label,
  onApply,
  onRemove,
  modeLabel,
  currentColor = '#000000',
}: ColorPickerPopoverProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [custom, setCustom] = useState<string>(currentColor);

  // Whenever the caret color changes, sync the custom-picker seed so it matches.
  // This is what makes the picker show "current color selected" out of the box.
  useEffect(() => {
    setCustom(currentColor);
  }, [currentColor]);

  const open = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);
  const close = useCallback(() => setAnchorEl(null), []);

  const apply = useCallback(
    (color: string) => {
      onApply(color);
      setCustom(color);
      setAnchorEl(null);
    },
    [onApply],
  );

  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustom(e.target.value);
    },
    [],
  );

  const handleCustomApply = useCallback(() => {
    if (custom) apply(custom);
  }, [custom, apply]);

  const handleRemove = useCallback(() => {
    onRemove();
    setAnchorEl(null);
  }, [onRemove]);

  const normalizedCurrent = (currentColor || '').toLowerCase();
  const isTransparent = normalizedCurrent === 'transparent' || normalizedCurrent === '';
  const modeLower = modeLabel.toLowerCase();

  return (
    <>
      <Tooltip title={label}>
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={open}
          aria-label={label}
          sx={{ position: 'relative' }}
        >
          {icon}
          {/* Small color dot under the icon shows the current caret color. */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 15,
              height: 3,
              borderRadius: 2,
              bgcolor: isTransparent ? 'transparent' : currentColor,
              border: isTransparent ? '1px dashed #9ca3af' : 'none',
            }}
          />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={close}
        disableAutoFocus
        disableEnforceFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 1.5, width: 240 } } }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {t('richTextEditor.colorPicker.modeColorSuffix', { mode: modeLabel })}
        </Typography>

        {/* If there's no selection, picking a color stages it for the next typed text
            instead of mutating the document. Communicate that to the user. */}
        {hasCollapsedSelection() && (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.disabled', mt: 0.5 }}>
            {t('richTextEditor.colorPicker.noSelectionHint')}
          </Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 0.5,
            mt: 1,
          }}
        >
          {PRESET_COLORS.map(c => {
            const isCurrent = !isTransparent && c.toLowerCase() === normalizedCurrent;
            return (
              <Box
                key={c}
                role="button"
                tabIndex={0}
                aria-label={t('richTextEditor.colorPicker.applyColorAria', { color: c })}
                aria-pressed={isCurrent}
                onMouseDown={e => e.preventDefault()}
                onClick={() => apply(c)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    apply(c);
                  }
                }}
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: '3px',
                  bgcolor: c,
                  border: '1px solid',
                  borderColor: isCurrent
                    ? 'primary.main'
                    : c === '#ffffff'
                      ? '#d1d5db'
                      : 'transparent',
                  outline: isCurrent ? '2px solid' : 'none',
                  outlineColor: 'primary.light',
                  outlineOffset: 1,
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                  '&:hover': { transform: 'scale(1.2)' },
                }}
              />
            );
          })}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              position: 'relative',
              width: 28,
              height: 28,
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: custom }} />
            <input
              type="color"
              value={isValidHex(custom) ? custom : '#000000'}
              onChange={handleCustomChange}
              aria-label={t('richTextEditor.colorPicker.customColorAria', { mode: modeLower })}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                border: 'none',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
            {custom.toUpperCase()}
          </Typography>
          <Button size="small" onMouseDown={e => e.preventDefault()} variant="outlined" onClick={handleCustomApply}>
            {t('richTextEditor.colorPicker.apply')}
          </Button>
        </Box>

        <Button
          size="small"
          onMouseDown={e => e.preventDefault()}
          color="inherit"
          fullWidth
          onClick={handleRemove}
          sx={{ mt: 1, textTransform: 'none' }}
        >
          {t('richTextEditor.colorPicker.removeColor', { mode: modeLower })}
        </Button>
      </Popover>
    </>
  );
}

function hasCollapsedSelection(): boolean {
  const sel = typeof window !== 'undefined' ? window.getSelection() : null;
  if (!sel || sel.rangeCount === 0) return true;
  return sel.isCollapsed;
}

function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
