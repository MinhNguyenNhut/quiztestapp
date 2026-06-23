import type { RichTextContent } from '../../../types/index.ts';
import type { BlankDefinition } from '../../../types/index.ts';

let blankCounter = 0;

export function generateBlankId(): string {
  blankCounter++;
  return `blank_${blankCounter}`;
}

export function resetBlankCounter(): void {
  blankCounter = 0;
}

export function insertBlankAtCursor(): BlankDefinition | null {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const blankId = generateBlankId();
  const placeholder = document.createElement('span');
  placeholder.contentEditable = 'false';
  placeholder.className = 'blank-placeholder';
  placeholder.dataset.blankId = blankId;
  placeholder.setAttribute('aria-label', `Blank ${blankCounter}`);
  placeholder.style.cssText =
    'display:inline-block;background:#eef2ff;border:2px dashed #4f46e5;border-radius:4px;padding:2px 12px;margin:0 2px;font-weight:600;color:#4f46e5;cursor:pointer;';
  placeholder.textContent = `[BLANK_${blankCounter}]`;
  range.deleteContents();
  range.insertNode(placeholder);
  range.setStartAfter(placeholder);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
  return { id: blankId, label: `Blank ${blankCounter}`, correctAnswer: '' };
}

export function extractBlanksFromHtml(html: string): BlankDefinition[] {
  const blanks: BlankDefinition[] = [];
  const regex = /data-blank-id="([^"]+)"[^>]*>\[BLANK_(\d+)\]<\/span>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    blanks.push({
      id: match[1],
      label: `Blank ${match[2]}`,
      correctAnswer: '',
    });
  }
  return blanks;
}

export function parseEditorContent(container: HTMLDivElement | null): RichTextContent {
  if (!container) return { html: '', text: '' };
  const html = container.innerHTML;
  const text = container.textContent || '';
  const blanks = extractBlanksFromHtml(html);
  return { html, text, blanks: blanks.length > 0 ? blanks : undefined };
}

export function setEditorContent(container: HTMLDivElement | null, content: RichTextContent): void {
  if (!container) return;
  container.innerHTML = content.html || '';
}

export function execFormat(command: string, value?: string): void {
  document.execCommand(command, false, value ?? undefined);
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) {
    const active = document.activeElement as HTMLElement | null;
    active?.focus();
  }
}

export function insertTable(rows: number, cols: number): void {
  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;width:100%;margin:8px 0;';
  table.setAttribute('border', '1');
  table.setAttribute('cellpadding', '8');
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const cell = r === 0 ? document.createElement('th') : document.createElement('td');
      cell.style.cssText = 'border:1px solid #d1d5db;padding:8px;min-width:60px;';
      cell.innerHTML = '&nbsp;';
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  }
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(table);
    range.setStartAfter(table);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export function insertImage(url: string, alt: string = ''): void {
  const img = document.createElement('img');
  img.src = url;
  img.alt = alt;
  img.style.cssText = 'max-width:100%;border-radius:8px;margin:8px 0;';
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);
    range.setStartAfter(img);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export function insertFormula(latex: string): void {
  const span = document.createElement('span');
  span.className = 'math-formula';
  span.dataset.latex = latex;
  span.style.cssText =
    'display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:4px 12px;margin:0 4px;font-family:monospace;font-size:1.1em;';
  span.textContent = latex;
  const sel = window.getSelection();
  if (sel && sel.rangeCount) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
