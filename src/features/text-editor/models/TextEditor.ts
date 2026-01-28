export type Position = {
  line: number;
  col: number;
};

export enum Source {
  ORIGINAL = "original",
  ADD = "add",
}

export default interface TextEditor {
  insert(content: string, at: Position): void;
  delete(at: Position): void;
  getContent(): string[];
  getText(): string;
  deleteRange(start: Position, end: Position): void;
  appendText(text: string): void;
}
