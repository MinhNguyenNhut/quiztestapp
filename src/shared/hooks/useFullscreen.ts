import { useCallback, useEffect, useState } from 'react';

interface FullscreenAPI {
  isFullscreen: boolean;
  enter: () => Promise<void>;
  exit: () => Promise<void>;
  toggle: () => Promise<void>;
  supported: boolean;
}

const getDoc = (): Document | null =>
  typeof document === 'undefined' ? null : document;

const isFullscreenElement = (): boolean => {
  const doc = getDoc();
  if (!doc) return false;
  return Boolean(doc.fullscreenElement);
};

const requestFullscreen = async (): Promise<void> => {
  const doc = getDoc();
  if (!doc?.documentElement) return;
  await doc.documentElement.requestFullscreen?.();
};

const exitFullscreen = async (): Promise<void> => {
  const doc = getDoc();
  if (!doc) return;
  await doc.exitFullscreen?.();
};

/**
 * useFullscreen — wraps the Fullscreen API. Tracks the current state and
 * exposes enter/exit/toggle. Safe to call in environments without the API.
 */
export function useFullscreen(): FullscreenAPI {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(isFullscreenElement);
  const supported = typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function';

  useEffect(() => {
    if (!supported) return;
    const handler = () => setIsFullscreen(isFullscreenElement());
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [supported]);

  const enter = useCallback(async () => {
    if (!supported) return;
    try {
      await requestFullscreen();
    } catch {
      // Swallow — user may have denied; UI falls back to non-fullscreen.
    }
  }, [supported]);

  const exit = useCallback(async () => {
    if (!supported) return;
    try {
      await exitFullscreen();
    } catch {
      // ignore
    }
  }, [supported]);

  const toggle = useCallback(async () => {
    if (isFullscreen) await exit();
    else await enter();
  }, [enter, exit, isFullscreen]);

  return { isFullscreen, enter, exit, toggle, supported };
}
