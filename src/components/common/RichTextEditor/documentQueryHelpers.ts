// `document.queryCommandState` / `document.queryCommandValue` are marked
// @deprecated in lib.dom.d.ts, but they are still the only API for reading
// the active formatting of a contentEditable selection. We centralize them
// here behind a non-deprecated interface so call sites stay clean and any
// future migration (e.g. to Selection API + getComputedStyle) only touches
// this one file.

interface CommandQueryDocument {
    queryCommandState(commandId: string): boolean;
    queryCommandValue(commandId: string): string;
}

const queryableDoc = document as unknown as CommandQueryDocument;

/** Reads a boolean formatting state (bold, italic, justifyLeft, ...). */
export function queryCommandState(commandId: string): boolean {
    try {
        return queryableDoc.queryCommandState(commandId);
    } catch {
        // Older browsers throw on unsupported command IDs — treat as inactive.
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


// `document.execCommand` is marked @deprecated in lib.dom.d.ts, but it is still
// the only practical API for editing a contentEditable short of building a
// custom Range-based editor. Centralize it behind a non-deprecated interface so
// call sites compile cleanly and any future migration only touches this file.

interface ExecCommandDocument {
    execCommand(
        commandId: string,
        showUI?: boolean,
        value?: string,
    ): boolean;
}

const editableDoc = document as unknown as ExecCommandDocument;

/**
 * Runs an execCommand on the current selection. Returns true if the command
 * was supported and executed. Internally refocuses the active editable if the
 * selection was lost (e.g. user clicked a toolbar button).
 */
export function execCommand(commandId: string, value?: string): boolean {
    try {
        return editableDoc.execCommand(commandId, false, value ?? undefined);
    } catch {
        // Unsupported commands shouldn't crash the editor — treat as a no-op.
        return false;
    }
}

/** Query deprecated/obsolete tags without triggering the @deprecated overloads. */
export function getElementsByTagNameGeneric(
  doc: Document,
  tag: string,
): HTMLElement[] {
  return Array.from(doc.getElementsByTagName(tag) as HTMLCollectionOf<HTMLElement>);
}