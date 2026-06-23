import { useRef, useState, useCallback, useEffect, type KeyboardEvent } from 'react';
import { Box, FormHelperText, Typography } from '@mui/material';
import EditorToolbar from './EditorToolbar.tsx';
import FormulaModal from './FormulaModal.tsx';
import ImageUploadModal from './ImageUploadModal.tsx';
import TableInsertModal from './TableInsertModal.tsx';
import {
  execFormat,
  parseEditorContent,
  setEditorContent,
  insertBlankAtCursor,
  insertTable,
  insertImage,
  insertFormula,
} from './utils.ts';
import type { RichTextContent } from '../../../types/index.ts';

interface RichTextEditorProps {
  value: RichTextContent;
  onChange: (content: RichTextContent) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
  showToolbar?: boolean;
  showBlanks?: boolean;
  label?: string;
  error?: boolean;
  helperText?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter question content...',
  minHeight = 250,
  maxHeight,
  disabled = false,
  showToolbar = true,
  showBlanks = false,
  label,
  error,
  helperText,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  // Sync external value into editor
  useEffect(() => {
    if (editorRef.current) {
      const current = parseEditorContent(editorRef.current);
      if (current.html !== value.html && !editorRef.current.contains(document.activeElement)) {
        setEditorContent(editorRef.current, value);
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const content = parseEditorContent(editorRef.current);
    onChange(content);
  }, [onChange]);

  const handleFormat = useCallback((command: string, cmdValue?: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    execFormat(command, cmdValue);
    handleInput();
  }, [disabled, handleInput]);

  const handleImageInsert = useCallback((url: string, alt: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    insertImage(url, alt);
    handleInput();
  }, [disabled, handleInput]);

  const handleTableInsert = useCallback((rows: number, cols: number) => {
    if (disabled) return;
    editorRef.current?.focus();
    insertTable(rows, cols);
    handleInput();
  }, [disabled, handleInput]);

  const handleFormulaInsert = useCallback((latex: string) => {
    if (disabled) return;
    editorRef.current?.focus();
    insertFormula(latex);
    handleInput();
  }, [disabled, handleInput]);

  const handleBlankInsert = useCallback(() => {
    if (disabled) return;
    editorRef.current?.focus();
    const blank = insertBlankAtCursor();
    if (blank) handleInput();
  }, [disabled, handleInput]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Save is handled by parent form
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleFormat('bold');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        handleFormat('italic');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        handleFormat('underline');
      }
    },
    [handleFormat],
  );

  return (
    <Box>
      {label && (
        <Typography
          variant="body2"
          sx={{ mb: 0.5, fontWeight: 600, color: error ? 'error.main' : 'text.primary' }}
        >
          {label}
        </Typography>
      )}
      <Box
        sx={{
          border: 1,
          borderColor: error ? 'error.main' : isFocused ? 'primary.main' : '#d1d5db',
          borderRadius: 2,
          overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
      >
        {showToolbar && (
          <EditorToolbar
            onFormat={handleFormat}
            onInsertImage={() => setImageOpen(true)}
            onInsertTable={() => setTableOpen(true)}
            onInsertFormula={() => setFormulaOpen(true)}
            onInsertBlank={showBlanks ? handleBlankInsert : undefined}
          />
        )}
        <Box
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          role="textbox"
          aria-multiline="true"
          aria-label={label || placeholder}
          sx={{
            minHeight,
            maxHeight: maxHeight || 'none',
            p: 2,
            outline: 'none',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            lineHeight: 1.6,
            fontSize: '0.95rem',
            color: disabled ? 'text.disabled' : 'text.primary',
            bgcolor: disabled ? '#f9fafb' : 'white',
            cursor: disabled ? 'not-allowed' : 'text',
            overflowY: 'auto',
            '&:empty:before': {
              content: `"${placeholder}"`,
              color: '#9ca3af',
              fontStyle: 'italic',
            },
            '& img': {
              maxWidth: '100%',
              borderRadius: 1,
              my: 1,
            },
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              my: 1,
            },
            '& td, & th': {
              border: '1px solid #d1d5db',
              p: 1,
            },
            '& th': {
              bgcolor: '#f9fafb',
              fontWeight: 600,
            },
            '& blockquote': {
              borderLeft: '3px solid #4f46e5',
              ml: 0,
              pl: 2,
              color: '#6b7280',
              fontStyle: 'italic',
            },
            '& pre': {
              bgcolor: '#f3f4f6',
              p: 2,
              borderRadius: 1,
              fontFamily: 'monospace',
              overflowX: 'auto',
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        />
      </Box>
      {helperText && (
        <FormHelperText error={error} sx={{ ml: 0 }}>
          {helperText}
        </FormHelperText>
      )}
      <FormulaModal
        open={formulaOpen}
        onClose={() => setFormulaOpen(false)}
        onInsert={handleFormulaInsert}
      />
      <ImageUploadModal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        onInsert={handleImageInsert}
      />
      <TableInsertModal
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        onInsert={handleTableInsert}
      />
    </Box>
  );
}
