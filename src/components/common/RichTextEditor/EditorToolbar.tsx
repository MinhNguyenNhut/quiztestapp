import { useCallback, useEffect, useState } from 'react';
import {
  Paper,
  IconButton,
  Divider,
  Select,
  MenuItem,
  Tooltip,
  Button,
  type SelectChangeEvent,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import FunctionsIcon from '@mui/icons-material/Functions';
import SubscriptIcon from '@mui/icons-material/Subscript';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ColorPickerPopover from './ColorPickerPopover.tsx';

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
  onInsertImage: () => void;
  onInsertTable: () => void;
  onInsertFormula: () => void;
  onInsertBlank?: () => void;
}

interface ActiveStates {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  subscript: boolean;
  superscript: boolean;
  orderedList: boolean;
  unorderedList: boolean;
  alignLeft: boolean;
  alignCenter: boolean;
  alignRight: boolean;
  quote: boolean;
  codeBlock: boolean;
}

const EMPTY_ACTIVE: ActiveStates = {
  bold: false,
  italic: false,
  underline: false,
  subscript: false,
  superscript: false,
  orderedList: false,
  unorderedList: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  quote: false,
  codeBlock: false,
};

export default function EditorToolbar({
  onFormat,
  onInsertImage,
  onInsertTable,
  onInsertFormula,
  onInsertBlank,
}: EditorToolbarProps) {
  const [blockType, setBlockType] = useState('p');
  const [active, setActive] = useState<ActiveStates>(EMPTY_ACTIVE);
  const [currentTextColor, setCurrentTextColor] = useState<string>('#000000');
  const [currentHighlight, setCurrentHighlight] = useState<string>('transparent');

  // Poll the document for selection state so toolbar buttons reflect the caret.
  const refreshActiveStates = useCallback(() => {
    try {
      const next: ActiveStates = {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        subscript: document.queryCommandState('subscript'),
        superscript: document.queryCommandState('superscript'),
        orderedList: document.queryCommandState('insertOrderedList'),
        unorderedList: document.queryCommandState('insertUnorderedList'),
        alignLeft: document.queryCommandState('justifyLeft'),
        alignCenter: document.queryCommandState('justifyCenter'),
        alignRight: document.queryCommandState('justifyRight'),
        quote: document.queryCommandState('formatBlock') && document.queryCommandValue('formatBlock') === 'blockquote',
        codeBlock: document.queryCommandValue('formatBlock') === 'pre',
      };
      setActive(next);

      // Read the text color at the current caret position.
      const fore = document.queryCommandValue('foreColor') as string | '' | null;
      if (fore) setCurrentTextColor(normalizeColor(fore) || '#000000');

      // hiliteColor is unreliable across browsers (Chrome reports empty/incorrectly),
      // so try queryCommandValue first, then fall back to walking the DOM from the
      // caret to find the actually-applied inline background-color.
      setCurrentHighlight(readHighlightAtCaret());
    } catch {
      // Ignore — older browsers can throw on unsupported commands.
    }
  }, []);

  useEffect(() => {
    const handler = () => refreshActiveStates();
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [refreshActiveStates]);

  const handleBlockChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const val = e.target.value;
      setBlockType(val);
      const tag = val === 'p' ? '<p>' : val === 'h1' ? '<h1>' : val === 'h2' ? '<h2>' : '<h3>';
      onFormat('formatBlock', tag);
      // Defer so the new block tag is committed before re-querying state.
      setTimeout(refreshActiveStates, 0);
    },
    [onFormat, refreshActiveStates],
  );

  const handleRemoveTextColor = useCallback(() => {
    onFormat('foreColor', '#000000');
  }, [onFormat]);

  const handleRemoveHighlight = useCallback(() => {
    // Setting 'transparent' makes the highlight effectively disappear across engines.
    onFormat('hiliteColor', 'transparent');
  }, [onFormat]);

  const handleLinkInsert = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) onFormat('createLink', url);
  }, [onFormat]);

  // Wrap onFormat so any toolbar-triggered command refreshes the active state
  // immediately after execCommand finishes (selectionchange may already have fired).
  const runFormat = useCallback(
    (command: string, value?: string) => {
      onFormat(command, value);
      setTimeout(refreshActiveStates, 0);
    },
    [onFormat, refreshActiveStates],
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 0.5,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.25,
        bgcolor: '#fafafa',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Paragraph Format */}
      <Select
        size="small"
        value={blockType}
        onChange={handleBlockChange}
        sx={{ minWidth: 120, mr: 0.5 }}
      >
        <MenuItem value="p">Normal</MenuItem>
        <MenuItem value="h1">Heading 1</MenuItem>
        <MenuItem value="h2">Heading 2</MenuItem>
        <MenuItem value="h3">Heading 3</MenuItem>
      </Select>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Bold, Italic, Underline */}
      <Tooltip title="Bold (Ctrl+B)">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('bold')}
          color={active.bold ? 'primary' : 'default'}
          aria-pressed={active.bold}
          sx={activeButtonSx(active.bold)}
        >
          <FormatBoldIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic (Ctrl+I)">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('italic')}
          color={active.italic ? 'primary' : 'default'}
          aria-pressed={active.italic}
          sx={activeButtonSx(active.italic)}
        >
          <FormatItalicIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline (Ctrl+U)">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('underline')}
          color={active.underline ? 'primary' : 'default'}
          aria-pressed={active.underline}
          sx={activeButtonSx(active.underline)}
        >
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Text Color & Highlight */}
      <ColorPickerPopover
        icon={<FormatColorTextIcon fontSize="small" />}
        label="Text Color"
        modeLabel="Text"
        currentColor={currentTextColor}
        onApply={c => runFormat('foreColor', c)}
        onRemove={handleRemoveTextColor}
      />
      <ColorPickerPopover
        icon={<BorderColorIcon fontSize="small" />}
        label="Highlight Color"
        modeLabel="Highlight"
        currentColor={currentHighlight}
        onApply={c => runFormat('hiliteColor', c)}
        onRemove={handleRemoveHighlight}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Subscript, Superscript */}
      <Tooltip title="Subscript">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('subscript')}
          color={active.subscript ? 'primary' : 'default'}
          aria-pressed={active.subscript}
          sx={activeButtonSx(active.subscript)}
        >
          <SubscriptIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Superscript">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('superscript')}
          color={active.superscript ? 'primary' : 'default'}
          aria-pressed={active.superscript}
          sx={activeButtonSx(active.superscript)}
        >
          <SuperscriptIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Quote & Code */}
      <Tooltip title="Quote">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('formatBlock', '<blockquote>')}
          color={active.quote ? 'primary' : 'default'}
          aria-pressed={active.quote}
          sx={activeButtonSx(active.quote)}
        >
          <FormatQuoteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Code Block">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('formatBlock', '<pre>')}
          color={active.codeBlock ? 'primary' : 'default'}
          aria-pressed={active.codeBlock}
          sx={activeButtonSx(active.codeBlock)}
        >
          <CodeIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Lists */}
      <Tooltip title="Ordered List">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('insertOrderedList')}
          color={active.orderedList ? 'primary' : 'default'}
          aria-pressed={active.orderedList}
          sx={activeButtonSx(active.orderedList)}
        >
          <FormatListNumberedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bullet List">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('insertUnorderedList')}
          color={active.unorderedList ? 'primary' : 'default'}
          aria-pressed={active.unorderedList}
          sx={activeButtonSx(active.unorderedList)}
        >
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Alignment */}
      <Tooltip title="Align Left">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('justifyLeft')}
          color={active.alignLeft ? 'primary' : 'default'}
          aria-pressed={active.alignLeft}
          sx={activeButtonSx(active.alignLeft)}
        >
          <FormatAlignLeftIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Center">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('justifyCenter')}
          color={active.alignCenter ? 'primary' : 'default'}
          aria-pressed={active.alignCenter}
          sx={activeButtonSx(active.alignCenter)}
        >
          <FormatAlignCenterIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Right">
        <IconButton
          size="small"
          onMouseDown={e => e.preventDefault()}
          onClick={() => runFormat('justifyRight')}
          color={active.alignRight ? 'primary' : 'default'}
          aria-pressed={active.alignRight}
          sx={activeButtonSx(active.alignRight)}
        >
          <FormatAlignRightIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Insert */}
      <Tooltip title="Insert Link">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={handleLinkInsert}>
          <InsertLinkIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Insert Image">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={onInsertImage}>
          <ImageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Insert Table">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={onInsertTable}>
          <TableChartIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Insert Formula">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={onInsertFormula}>
          <FunctionsIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {onInsertBlank && (
        <>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Button size="small" variant="outlined" onClick={onInsertBlank} sx={{ ml: 0.5 }}>
            + Blank
          </Button>
        </>
      )}
    </Paper>
  );
}

function activeButtonSx(isActive: boolean) {
  return isActive
    ? {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        '&:hover': { bgcolor: 'primary.dark' },
      }
    : undefined;
}

// Convert the browser's `rgb(r, g, b)` (or `#rrggbb`) color string into `#rrggbb`
// so it can be compared against PRESET_COLORS and `<input type="color">`.
function normalizeColor(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith('#')) return trimmed;
  const rgbMatch = trimmed.match(/rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(',').map(p => parseInt(p.trim(), 10));
    if (parts.length >= 3 && parts.every(n => !Number.isNaN(n))) {
      const [r, g, b] = parts;
      const toHex = (n: number) => n.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }
  return null;
}

// hiliteColor via queryCommandValue is unreliable (Chrome often returns '' even when
// a highlight is applied), so first try it, then fall back to walking up the DOM
// from the current caret/selection node to find the nearest ancestor that actually
// has an inline background-color set.
function readHighlightAtCaret(): string {
  try {
    const viaCommand = document.queryCommandValue('hiliteColor') as string | '' | null;
    const normalized = viaCommand ? normalizeColor(viaCommand) : null;
    if (normalized && normalized !== '#ffffff') return normalized;
  } catch {
    // queryCommandValue('hiliteColor') can throw in some browsers — ignore and fall back.
  }

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 'transparent';

  let node: Node | null = sel.anchorNode;
  // anchorNode can be a text node — start the walk from its parent element.
  if (node && node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  while (node && node instanceof HTMLElement) {
    const bg = node.style.backgroundColor;
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      const normalized = normalizeColor(bg);
      if (normalized) return normalized;
    }
    node = node.parentElement;
  }

  return 'transparent';
}
