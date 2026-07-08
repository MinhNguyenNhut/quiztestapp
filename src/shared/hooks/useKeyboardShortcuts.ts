import { useEffect } from 'react';

export interface KeyboardShortcutMap {
  [combo: string]: (event: KeyboardEvent) => void;
}

/**
 * Parse a combo string like "Ctrl+Enter" or "ArrowRight" into a matcher.
 */
const matchCombo = (combo: string, event: KeyboardEvent): boolean => {
  const parts = combo.split('+').map((p) => p.trim().toLowerCase());
  const key = parts[parts.length - 1];
  const wantCtrl = parts.includes('ctrl') || parts.includes('cmd');
  const wantShift = parts.includes('shift');
  const wantAlt = parts.includes('alt');

  const hasCtrl = event.ctrlKey || event.metaKey;
  if (wantCtrl !== hasCtrl) return false;
  if (wantShift !== event.shiftKey) return false;
  if (wantAlt !== event.altKey) return false;
  return event.key.toLowerCase() === key;
};

/**
 * useKeyboardShortcuts — bind a map of combo -> handler. Bindings are
 * attached to `document`. Handlers can `event.preventDefault()` to
 * suppress browser defaults. Disabled when an input/textarea has focus
 * unless the combo contains a modifier key.
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcutMap,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      for (const combo of Object.keys(shortcuts)) {
        if (matchCombo(combo, event)) {
          // Suppress letter shortcuts when typing in a field.
          if (inField && !combo.toLowerCase().includes('ctrl') && !combo.toLowerCase().includes('cmd')) {
            continue;
          }
          shortcuts[combo](event);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
}
