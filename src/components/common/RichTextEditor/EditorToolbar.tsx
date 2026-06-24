import { useCallback, useState } from 'react';
import {
  Paper,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Select,
  MenuItem,
  Tooltip,
  Box,
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

export default function EditorToolbar({
  onFormat,
  onInsertImage,
  onInsertTable,
  onInsertFormula,
  onInsertBlank,
}: EditorToolbarProps) {
  const [blockType, setBlockType] = useState('p');

  const handleBlockChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const val = e.target.value;
      setBlockType(val);
      const cmd = val === 'p' ? 'formatBlock' : 'formatBlock';
      const tag = val === 'p' ? '<p>' : val === 'h1' ? '<h1>' : val === 'h2' ? '<h2>' : '<h3>';
      onFormat(cmd, tag);
    },
    [onFormat],
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
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('bold')}>
          <FormatBoldIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic (Ctrl+I)">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('italic')}>
          <FormatItalicIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline (Ctrl+U)">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('underline')}>
          <FormatUnderlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Text Color & Highlight */}
      <ColorPickerPopover
        icon={<FormatColorTextIcon fontSize="small" />}
        label="Text Color"
        modeLabel="Text"
        onApply={c => onFormat('foreColor', c)}
        onRemove={handleRemoveTextColor}
      />
      <ColorPickerPopover
        icon={<BorderColorIcon fontSize="small" />}
        label="Highlight Color"
        modeLabel="Highlight"
        onApply={c => onFormat('hiliteColor', c)}
        onRemove={handleRemoveHighlight}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Subscript, Superscript */}
      <Tooltip title="Subscript">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('subscript')}>
          <SubscriptIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Superscript">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('superscript')}>
          <SuperscriptIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Quote & Code */}
      <Tooltip title="Quote">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('formatBlock', '<blockquote>')}>
          <FormatQuoteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Code Block">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('formatBlock', '<pre>')}>
          <CodeIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Lists */}
      <Tooltip title="Ordered List">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('insertOrderedList')}>
          <FormatListNumberedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bullet List">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('insertUnorderedList')}>
          <FormatListBulletedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Alignment */}
      <Tooltip title="Align Left">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('justifyLeft')}>
          <FormatAlignLeftIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Center">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('justifyCenter')}>
          <FormatAlignCenterIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Right">
        <IconButton size="small" onMouseDown={e => e.preventDefault()} onClick={() => onFormat('justifyRight')}>
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




