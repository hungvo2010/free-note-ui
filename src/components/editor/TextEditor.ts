export type Position = {
  line: number;
  character: number;
};

export enum Source {
  ORIGINAL = "original",
  ADD = "add",
}

export default interface TextEditor {
  insert(content: string, at: Position): void;
  delete(at: Position): void;
  getText(): string[];
  deleteRange(start: Position, end: Position): void;
}
