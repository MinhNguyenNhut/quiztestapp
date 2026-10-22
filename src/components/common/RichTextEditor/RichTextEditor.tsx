import { useRef, useState, useCallback, useEffect, useMemo, memo, type KeyboardEvent } from 'react';
import { Box, FormHelperText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
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
  clearHighlightInSelection,
  sanitizePastedHtml,
  applyFontFamily,
  applyFontSize,
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

function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 250,
  maxHeight,
  disabled = false,
  showToolbar = true,
  showBlanks = false,
  label,
  error,
  helperText,
}: RichTextEditorProps) {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder ?? t('richTextEditor.defaultPlaceholder');
  const editorRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const debounceRef = useRef<number | null>(null);
  const lastHtmlRef = useRef<string>('');
  const isFocusedRef = useRef<boolean>(false);
  const savedSelectionRef = useRef<Range | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Only sync external value into editor if it actually changed, and avoid 
  // running expensive parseEditorContent inside this effect.
  useEffect(() => {
    if (editorRef.current && value.html !== lastHtmlRef.current) {
      if (!editorRef.current.contains(document.activeElement)) {
        setEditorContent(editorRef.current, value);
        lastHtmlRef.current = value.html || '';
      }
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, []);

  // Remember the last selection that was inside the editor. Saving it on blur is
  // too late: when focus moves to the font-size <input>, the browser has already
  // moved the document selection into the input.
  useEffect(() => {
    const handleSelectionChange = () => {
      const el = editorRef.current;
      const sel = window.getSelection();
      if (!el || !sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) return;

      // When focus leaves the editor (e.g. the user clicked into the font-size
      // input), browsers such as Safari/Firefox report the old selection as a
      // collapsed "ghost" caret that still appears to live inside the editor.
      // Never let that ghost caret overwrite a real text selection that was
      // saved while the editor had focus — otherwise pressing Enter in the
      // font-size input would format a collapsed caret instead of the text.
      const editorHasFocus = el.contains(document.activeElement);
      const saved = savedSelectionRef.current;
      if (
        !editorHasFocus &&
        range.collapsed &&
        saved &&
        !saved.collapsed &&
        el.contains(saved.commonAncestorContainer)
      ) {
        return;
      }
      savedSelectionRef.current = range.cloneRange();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Snapshot the selection synchronously right before a toolbar control (the
  // font-size text field) is about to steal focus. mousedown fires BEFORE the
  // browser moves the document selection into the control, so this is the most
  // reliable capture point — it does not depend on selectionchange ordering.
  const captureSelection = useCallback(() => {
    const el = editorRef.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (el.contains(range.commonAncestorContainer)) {
      savedSelectionRef.current = range.cloneRange();
    }
  }, []);

  const flushChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    if (html === lastHtmlRef.current) return;
    lastHtmlRef.current = html;
    onChangeRef.current(parseEditorContent(el));
  }, []);

  const handleInput = useCallback(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      debounceRef.current = null;
      const el = editorRef.current;
      if (!el) return;
      const html = el.innerHTML;
      if (html === lastHtmlRef.current) return;
      lastHtmlRef.current = html;
      onChangeRef.current(parseEditorContent(el));
    }, 250);
  }, []);

  const handleFormat = useCallback(
    (command: string, cmdValue?: string) => {
      if (disabled) return;

      const el = editorRef.current;
      // Read the saved selection BEFORE focus(): refocusing the contentEditable
      // can make the browser re-report (and possibly collapse) the selection,
      // and the selectionchange listener may then rewrite the ref before we
      // get a chance to use it.
      const saved = savedSelectionRef.current;
      el?.focus();

      // Focusing a contentEditable can reset the caret, so restore the last
      // selection that was inside the editor.
      if (saved && el?.contains(saved.commonAncestorContainer)) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(saved.cloneRange());
        }
      }

      if (command === '__clearHighlight__') {
        clearHighlightInSelection();
      } else if (command === '__fontFamily__') {
        if (cmdValue && cmdValue !== '__default__') {
          applyFontFamily(cmdValue);
        }
      } else if (command === '__fontSize__') {
        if (cmdValue && cmdValue !== '__default__') {
          const px = parseInt(cmdValue, 10);
          if (!Number.isNaN(px)) applyFontSize(px);
        }
      } else {
        execFormat(command, cmdValue);
      }
      handleInput();
    },
    [disabled, handleInput],
  );

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
        flushChange();
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
    [handleFormat, flushChange],
  );

  const handleFocus = useCallback(() => {
    isFocusedRef.current = true;
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    isFocusedRef.current = false;
    setIsFocused(false);
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    flushChange();
  }, [flushChange]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      e.preventDefault();

      const html = e.clipboardData.getData('text/html');
      const text = e.clipboardData.getData('text/plain');

      editorRef.current?.focus();

      if (html) {
        const cleaned = sanitizePastedHtml(html);

        // Insert the sanitized HTML at the caret via the Range API (cross-browser
        // safe — execCommand('insertHTML') is missing in Firefox and deprecated
        // everywhere else anyway).
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          range.deleteContents();
          const fragment = range.createContextualFragment(cleaned);
          const lastNode = fragment.lastChild;
          range.insertNode(fragment);
          if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      } else if (text) {
        execFormat('insertText', text);
      }

      handleInput();
    },
    [disabled, handleInput],
  );

  const editorSx = useMemo(
    () => ({
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
      overflowY: 'auto' as const,
      '&:empty:before': {
        content: `"${resolvedPlaceholder}"`,
        color: '#9ca3af',
        fontStyle: 'italic',
      },
      '& img': { maxWidth: '100%', borderRadius: 1, my: 1 },
      '& table': { borderCollapse: 'collapse', width: '100%', my: 1 },
      '& td, & th': { border: '1px solid #d1d5db', p: 1 },
      '& th': { bgcolor: '#f9fafb', fontWeight: 600 },
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
      '& a': { color: 'primary.main', textDecoration: 'underline' },
    }),
    [minHeight, maxHeight, disabled, resolvedPlaceholder],
  );

  const wrapperSx = useMemo(
    () => ({
      border: 1,
      borderColor: error ? 'error.main' : isFocused ? 'primary.main' : '#d1d5db',
      borderRadius: 2,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }),
    [error, isFocused],
  );

  const handleInsertImage = useCallback(() => setImageOpen(true), []);
  const handleInsertTable = useCallback(() => setTableOpen(true), []);
  const handleInsertFormula = useCallback(() => setFormulaOpen(true), []);

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
      <Box sx={wrapperSx}>
        {showToolbar && (
          <EditorToolbar
            isEditorFocused={isFocused}
            onFormat={handleFormat}
            onCaptureSelection={captureSelection}
            onInsertImage={handleInsertImage}
            onInsertTable={handleInsertTable}
            onInsertFormula={handleInsertFormula}
            onInsertBlank={showBlanks ? handleBlankInsert : undefined}
          />
        )}
        <Box
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          role="textbox"
          aria-multiline="true"
          aria-label={label || resolvedPlaceholder}
          sx={editorSx}
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

export default memo(RichTextEditor);