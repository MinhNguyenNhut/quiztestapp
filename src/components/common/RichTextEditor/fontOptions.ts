export interface FontOption {
  value: string;
  label: string;
}

// Web-safe / system fonts first, then Google Fonts (see the <link> in step 5).
// Every font here supports Vietnamese diacritics.
export const FONT_FAMILIES: ReadonlyArray<FontOption> = [
  // Sans-serif
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: "'Segoe UI', Tahoma, sans-serif", label: 'Segoe UI' },
  { value: 'Tahoma, Geneva, sans-serif', label: 'Tahoma' },
  { value: "'Trebuchet MS', sans-serif", label: 'Trebuchet MS' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
  { value: 'Calibri, Carlito, sans-serif', label: 'Calibri' },
  { value: "'Be Vietnam Pro', sans-serif", label: 'Be Vietnam Pro' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: "'Noto Sans', sans-serif", label: 'Noto Sans' },
  { value: 'Nunito, sans-serif', label: 'Nunito' },
  { value: "'Source Sans 3', sans-serif", label: 'Source Sans 3' },
  { value: 'Raleway, sans-serif', label: 'Raleway' },
  { value: 'Quicksand, sans-serif', label: 'Quicksand' },
  { value: 'Lexend, sans-serif', label: 'Lexend' },
  // Serif
  { value: "'Times New Roman', Times, serif", label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Cambria, serif', label: 'Cambria' },
  { value: "'Palatino Linotype', Palatino, serif", label: 'Palatino Linotype' },
  { value: 'Garamond, serif', label: 'Garamond' },
  { value: "'Noto Serif', serif", label: 'Noto Serif' },
  { value: "'Playfair Display', serif", label: 'Playfair Display' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Lora, serif', label: 'Lora' },
  // Monospace
  { value: "'Courier New', Courier, monospace", label: 'Courier New' },
  { value: "Consolas, 'Roboto Mono', monospace", label: 'Consolas' },
  { value: "'Roboto Mono', monospace", label: 'Roboto Mono' },
  // Handwriting / display
  { value: "'Comic Sans MS', cursive", label: 'Comic Sans MS' },
  { value: "'Dancing Script', cursive", label: 'Dancing Script' },
  { value: 'Pacifico, cursive', label: 'Pacifico' },
];

export const FONT_SIZE_PRESETS: ReadonlyArray<number> = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 60, 72,
];
export const MIN_FONT_SIZE = 6;
export const MAX_FONT_SIZE = 200;
export const DEFAULT_FONT_SIZE = 16;

const firstFamily = (raw: string) =>
  raw.split(',')[0].replace(/['"]/g, '').trim().toLowerCase();

/** Maps the font found at the caret (quotes stripped, order may differ) to a list value, or ''. */
export function matchFontFamily(raw: string): string {
  if (!raw) return '';
  const target = firstFamily(raw);
  return FONT_FAMILIES.find((f) => firstFamily(f.value) === target)?.value ?? '';
}