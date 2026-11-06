import { useCallback, useRef } from 'react';
import type { PointerEvent } from 'react';

export function useOptionDrag(move: (from: number, to: number) => void) {
  const draggedIndex = useRef<number | null>(null);
  const previousCursor = useRef('');

  const onPointerDown = useCallback((index: number, event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    draggedIndex.current = index;
    previousCursor.current = document.body.style.cursor;
    document.body.style.cursor = 'grabbing';
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const onPointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
    const from = draggedIndex.current;
    draggedIndex.current = null;
    document.body.style.cursor = previousCursor.current;
    if (from === null) return;

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-option-row]');
    const to = Number(target?.dataset.optionIndex);
    if (!target || !Number.isInteger(to) || to < 0 || from === to) return;

    const list = target.parentElement;
    const rows = list
      ? Array.from(list.querySelectorAll<HTMLElement>('[data-option-row]'))
      : [];
    const previousRects = new Map(
      rows.map((row) => [row.dataset.optionId, row.getBoundingClientRect()]),
    );

    move(from, to);
    if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    requestAnimationFrame(() => {
      const currentRows = Array.from(list.querySelectorAll<HTMLElement>('[data-option-row]'));
      currentRows.forEach((row) => {
        const previousRect = previousRects.get(row.dataset.optionId);
        if (!previousRect) return;
        const currentRect = row.getBoundingClientRect();
        const x = previousRect.left - currentRect.left;
        const y = previousRect.top - currentRect.top;
        if (x === 0 && y === 0) return;
        row.style.transition = 'none';
        row.style.transform = `translate(${x}px, ${y}px)`;
      });

      void list.offsetHeight;
      requestAnimationFrame(() => {
        currentRows.forEach((row) => {
          if (!row.style.transform) return;
          row.style.transition = 'transform 260ms cubic-bezier(0.2, 0, 0, 1)';
          row.style.transform = '';
        });
      });
    });
  }, [move]);

  const onPointerCancel = useCallback(() => {
    draggedIndex.current = null;
    document.body.style.cursor = previousCursor.current;
  }, []);

  return { onPointerDown, onPointerUp, onPointerCancel };
}
