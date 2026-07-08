import { useEffect, useRef } from 'react';

export interface AutoSaveOptions {
  /** Debounce window in ms. */
  delay?: number;
  /** Called with the latest payload after the debounce window elapses. */
  onSave: (key: string, value: unknown) => void;
}

/**
 * useAutoSave — fires `onSave(key, value)` after `delay` ms of inactivity
 * for the given `key`/`value` pair. Used by the exam page to persist
 * the session to sessionStorage on every change.
 */
export function useAutoSave<T>(key: string, value: T, options: AutoSaveOptions): void {
  const { delay = 800, onSave } = options;
  const timerRef = useRef<number | null>(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      onSaveRef.current(key, value);
    }, delay);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [key, value, delay]);
}
