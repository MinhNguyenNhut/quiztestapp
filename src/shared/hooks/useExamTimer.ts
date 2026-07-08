import { useEffect, useRef, useState } from 'react';

export type TimerColor = 'normal' | 'warning' | 'critical';

export interface ExamTimerInfo {
  formatted: string;
  /** Whole minutes remaining (for the sidebar copy). */
  minutes: number;
  /** Whole seconds remaining. */
  seconds: number;
  color: TimerColor;
  pulse: boolean;
  expired: boolean;
}

/**
 * Format seconds as HH:MM:SS or MM:SS depending on duration.
 */
const format = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * useExamTimer — passive hook. The reducer owns `remainingSeconds`; this
 * hook only derives display values (formatting, color, pulse) from it.
 *
 * `onExpire` fires once when `remainingSeconds` hits 0.
 */
export function useExamTimer(
  remainingSeconds: number,
  onExpire?: () => void,
): ExamTimerInfo {
  const expiredRef = useRef(false);
  const [, setTick] = useState(0);

  // Force a re-render every second so the formatted string stays in sync
  // even if no other state changes — the parent is the source of truth
  // for `remainingSeconds`.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (remainingSeconds === 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
    }
    if (remainingSeconds > 0 && expiredRef.current) {
      expiredRef.current = false;
    }
  }, [remainingSeconds, onExpire]);

  let color: TimerColor = 'normal';
  if (remainingSeconds <= 60) color = 'critical';
  else if (remainingSeconds <= 5 * 60) color = 'critical';
  else if (remainingSeconds <= 10 * 60) color = 'warning';

  const pulse = remainingSeconds > 0 && remainingSeconds <= 5 * 60;

  return {
    formatted: format(remainingSeconds),
    minutes: Math.floor(remainingSeconds / 60),
    seconds: remainingSeconds % 60,
    color,
    pulse,
    expired: remainingSeconds === 0,
  };
}
