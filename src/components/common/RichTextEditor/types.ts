export interface EditorCommand {
  name: string;
  value?: string;
}

export type TextAlignment = 'left' | 'center' | 'right';

export interface TableData {
  rows: number;
  cols: number;
}
