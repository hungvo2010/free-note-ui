import TextEditor, { Position } from "./TextEditor";

class SimpleTextEditor implements TextEditor {
  constructor(private text: string) {}
  insert(content: string, at: Position): void {
    throw new Error("Method not implemented.");
  }
  delete(at: Position): void {
    throw new Error("Method not implemented.");
  }
  getText(): string[] {
    throw new Error("Method not implemented.");
  }
  deleteRange(start: Position, end: Position): void {
    throw new Error("Method not implemented.");
  }

  append(text: string): void {
    this.text += text;
  }
}
