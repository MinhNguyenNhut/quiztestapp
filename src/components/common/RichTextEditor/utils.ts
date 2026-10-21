// utils.ts
import type { RichTextContent } from '../../../types/index.ts';
import type { BlankDefinition } from '../../../types/index.ts';

// ---------------------------------------------------------------------------
// Deprecated-API quarantine helpers
// ---------------------------------------------------------------------------
// `document.execCommand`, `document.queryCommandState`, and
// `document.queryCommandValue` are all marked @deprecated in lib.dom.d.ts,
// but they remain the only practical API for editing a contentEditable.
// Centralize them behind non-deprecated interfaces so call sites compile
// cleanly and any future migration only touches this file.

interface ExecCommandDocument {
  execCommand(commandId: string, showUI?: boolean, value?: string): boolean;
}
interface CommandQueryDocument {
  queryCommandState(commandId: string): boolean;
  queryCommandValue(commandId: string): string;
}

const editableDoc = document as unknown as ExecCommandDocument;
const queryableDoc = document as unknown as CommandQueryDocument;

/** Runs an execCommand on the current selection. Returns true on success. */
export function execCommand(commandId: string, value?: string): boolean {
  try {
    return editableDoc.execCommand(commandId, false, value ?? undefined);
  } catch {
    // Unsupported commands shouldn't crash the editor — treat as a no-op.
    return false;
  }
}

/** Reads a boolean formatting state (bold, italic, justifyLeft, ...). */
export function queryCommandState(commandId: string): boolean {
  try {
    return queryableDoc.queryCommandState(commandId);
  } catch {
    return false;
  }
}

/** Reads a string formatting value (formatBlock, foreColor, hiliteColor, ...). */
export function queryCommandValue(commandId: string): string {
  try {
    return queryableDoc.queryCommandValue(commandId) ?? '';
  } catch {
    return '';
  }
}

/**
 * Query obsolete tags (font, center, marquee, tt, ...) without triggering the
 * deprecation warnings on the HTMLFontElement-specific overloads of
 * getElementsByTagName / querySelectorAll. The deprecation is attached to
 * HTMLFontElement et al., so casting through HTMLElement bypasses the warning
 * while remaining type-safe at runtime.
 */
export function getElementsByTagNameGeneric(
  doc: Document,
  tag: string,
): HTMLElement[] {
  return Array.from(
    doc.getElementsByTagName(tag) as HTMLCollectionOf<HTMLElement>,
  );
}

// ---------------------------------------------------------------------------
// Blank-placeholder management
// ---------------------------------------------------------------------------

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
  // Fast path: skip regex entirely when no blanks exist in the document.
  if (html.indexOf('data-blank-id') === -1) return [];
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

// ---------------------------------------------------------------------------
// Editor content read / write
// ---------------------------------------------------------------------------

export function parseEditorContent(
  container: HTMLDivElement | null,
): RichTextContent {
  if (!container) return { html: '', text: '' };
  const html = container.innerHTML;
  const text = container.textContent || '';
  const blanks = extractBlanksFromHtml(html);
  return { html, text, blanks: blanks.length > 0 ? blanks : undefined };
}

export function setEditorContent(
  container: HTMLDivElement | null,
  content: RichTextContent,
): void {
  if (!container) return;
  container.innerHTML = content.html || '';
}

export function execFormat(command: string, value?: string): void {
  execCommand(command, value);
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) {
    const active = document.activeElement as HTMLElement | null;
    active?.focus();
  }
}

// ---------------------------------------------------------------------------
// Inline insert helpers (tables, images, formulas)
// ---------------------------------------------------------------------------

export function insertTable(rows: number, cols: number): void {
  const table = document.createElement('table');
  table.style.cssText = 'border-collapse:collapse;width:100%;margin:8px 0;';
  table.setAttribute('border', '1');
  table.setAttribute('cellpadding', '8');
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
      const cell =
        r === 0 ? document.createElement('th') : document.createElement('td');
      cell.style.cssText =
        'border:1px solid #d1d5db;padding:8px;min-width:60px;';
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

// ---------------------------------------------------------------------------
// Highlight clearing (real fix for the "can't remove pasted bg color" bug)
// ---------------------------------------------------------------------------

/**
 * Strip inline background-color from every element that intersects the current
 * selection. `execCommand('hiliteColor', 'transparent')` only adds a new
 * transparent layer on top of existing inline styles, so it can't clear pasted
 * backgrounds — we walk the selection range with a TreeWalker instead.
 */
export function clearHighlightInSelection(): void {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  if (range.collapsed) return;

  const root =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement;
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let node: Node | null = walker.currentNode;

  while (node) {
    if (node instanceof HTMLElement && range.intersectsNode(node)) {
      const style = node.style;
      if (style.backgroundColor && style.backgroundColor !== 'transparent') {
        style.removeProperty('background-color');
        style.removeProperty('background');
        if (style.length === 0) node.removeAttribute('style');
      }
    }
    node = walker.nextNode();
  }

  // Re-select the same range — TreeWalker doesn't disturb it, but be defensive.
  sel.removeAllRanges();
  sel.addRange(range);
}

// ---------------------------------------------------------------------------
// Paste sanitization (prevents background colors from entering the editor)
// ---------------------------------------------------------------------------

const ALLOWED_STYLE_PROPS = new Set<string>([
  'color',
  'font-weight',
  'font-style',
  'text-decoration',
  'text-decoration-line',
  'font-size',
  'font-family',
  'vertical-align',
  'text-align',
]);

/**
 * Sanitize HTML coming from the clipboard before it lands in the contentEditable.
 * Strips background colors, external classes, scripts, and unsafe tags so the
 * editor only inherits semantic + character-level formatting from the source.
 */
export function sanitizePastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Drop dangerous / non-content nodes entirely.
  doc
    .querySelectorAll('script, style, meta, link, title, head, base, noscript')
    .forEach((el) => el.remove());

  // Unwrap <font> tags but preserve their color via a <span>. Uses the generic
  // helper to avoid the @deprecated HTMLFontElement overloads on
  // getElementsByTagName('font') / querySelectorAll('font').
  getElementsByTagNameGeneric(doc, 'font').forEach((font) => {
    const color = font.getAttribute('color');
    const span = doc.createElement('span');
    if (color) span.style.color = color;
    while (font.firstChild) span.appendChild(font.firstChild);
    font.replaceWith(span);
  });

  // Strip unwanted inline styles on every surviving element.
  doc.querySelectorAll('*').forEach((el) => {
    if (!(el instanceof HTMLElement)) return;

    // Remove class names from external sites (we don't ship their CSS).
    el.removeAttribute('class');

    // Remove IDs from external content (avoid clashing with our own IDs).
    el.removeAttribute('id');

    // Filter inline styles down to an allowlist — this is what kills
    // background-color, margin, padding, line-height, font-family from the
    // source page, while keeping bold/italic/underline/color.
    const style = el.style;
    const toRemove: string[] = [];
    for (let i = 0; i < style.length; i++) {
      const prop = style.item(i);
      if (!ALLOWED_STYLE_PROPS.has(prop)) toRemove.push(prop);
    }
    toRemove.forEach((p) => style.removeProperty(p));
    if (style.length === 0) el.removeAttribute('style');

    // Strip obviously useless attributes from Word / Google Docs.
    [
      'align',
      'valign',
      'bgcolor',
      'face',
      'size',
      'width',
      'height',
      'cellspacing',
      'cellpadding',
    ].forEach((attr) => el.removeAttribute(attr));
  });

  return doc.body.innerHTML;
}


// ---------------------------------------------------------------------------
// Font family / font size application + reading
// ---------------------------------------------------------------------------

/**
 * Apply a font family to the current selection. execCommand('fontName') wraps
 * the content in a legacy <font face="..."> tag, so we follow up by walking
 * those <font> elements and converting them to <span style="font-family: ...">
 * to match the sanitized model used everywhere else.
 */
export function applyFontFamily(family: string): void {
  if (!family) return;
  execCommand('fontName', family);

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  // After execCommand, the selection's commonAncestorContainer is typically
  // INSIDE the newly-created <font> element. getElementsByTagName only returns
  // descendants, so if rootEl IS the <font>, the lookup returns nothing — we
  // need to handle that case explicitly.
  const rootEl: HTMLElement | null =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement;
  if (!rootEl) return;

  // Case 1: rootEl itself is the <font face="..."> we just created.
  if (rootEl.tagName === 'FONT' && rootEl.hasAttribute('face')) {
    const face = rootEl.getAttribute('face') || family;
    const span = document.createElement('span');
    span.style.fontFamily = face;
    while (rootEl.firstChild) span.appendChild(rootEl.firstChild);
    rootEl.replaceWith(span);
    return;
  }

  // Case 2: <font> elements are descendants of rootEl (selection spanned
  // multiple blocks).
  const fonts = Array.from(
    rootEl.getElementsByTagName('font') as HTMLCollectionOf<HTMLElement>,
  );
  for (const font of fonts) {
    if (!font.hasAttribute('face')) continue;
    if (!range.intersectsNode(font)) continue;
    const face = font.getAttribute('face') || family;
    const span = document.createElement('span');
    span.style.fontFamily = face;
    while (font.firstChild) span.appendChild(font.firstChild);
    font.replaceWith(span);
  }
}

/**
 * Apply a pixel-based font size to the current selection. execCommand('fontSize')
 * only accepts legacy HTML sizes 1-7, so we use the standard workaround:
 * wrap the selection in <font size="7">, then walk those <font> elements and
 * replace them with <span style="font-size: Npx">.
 */
export function applyFontSize(px: number): void {
  if (!px) return;
  execCommand('fontSize', '7');

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);

  const rootEl: HTMLElement | null =
    range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement)
      : range.commonAncestorContainer.parentElement;
  if (!rootEl) return;

  // Case 1: rootEl itself is the <font size="7"> we just created.
  if (rootEl.tagName === 'FONT' && rootEl.getAttribute('size') === '7') {
    const span = document.createElement('span');
    span.style.fontSize = `${px}px`;
    while (rootEl.firstChild) span.appendChild(rootEl.firstChild);
    rootEl.replaceWith(span);
    return;
  }

  // Case 2: <font size="7"> elements are descendants of rootEl.
  const fonts = Array.from(
    rootEl.getElementsByTagName('font') as HTMLCollectionOf<HTMLElement>,
  );
  for (const font of fonts) {
    if (font.getAttribute('size') !== '7') continue;
    if (!range.intersectsNode(font)) continue;
    const span = document.createElement('span');
    span.style.fontSize = `${px}px`;
    while (font.firstChild) span.appendChild(font.firstChild);
    font.replaceWith(span);
  }
}

/**
 * Read the effective font family at the current caret by walking up from the
 * selection anchor to find the nearest inline font-family style.
 */
export function readFontFamilyAtCaret(): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';

  let node: Node | null = sel.anchorNode;
  if (node && node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  while (node && node instanceof HTMLElement) {
    const family = node.style.fontFamily;
    if (family) return family.replace(/['"]/g, '');
    node = node.parentElement;
  }

  return '';
}

/**
 * Read the effective font size at the current caret by walking up from the
 * selection anchor to find the nearest inline font-size style.
 */
export function readFontSizeAtCaret(): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';

  let node: Node | null = sel.anchorNode;
  if (node && node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }

  while (node && node instanceof HTMLElement) {
    const size = node.style.fontSize;
    if (size) return size;
    node = node.parentElement;
  }

  return '';
}