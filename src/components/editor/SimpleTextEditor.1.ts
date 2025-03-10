import TextEditor from "./TextEditor";

class SimpleTextEditor implements TextEditor {
  constructor(private text: string) {}
  insert(text: string, position: number): void {
    this.text = this.text.slice(0, position) + text + this.text.slice(position);
  }
  delete(start: number, end: number): void {
    this.text = this.text.slice(0, start) + this.text.slice(end);
  }
  getText(): string {
    return this.text;
  }
  append(text: string): void {
    this.text += text;
  }
}
