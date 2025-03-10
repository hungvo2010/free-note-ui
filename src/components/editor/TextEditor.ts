export default interface TextEditor {
  insert(text: string, position: number): void;
  delete(start: number, end: number): void;
  getText(): string;
  append(text: string): void;
}
