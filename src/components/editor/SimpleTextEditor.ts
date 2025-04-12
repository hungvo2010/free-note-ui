import TextEditor, { Position } from "./TextEditor";

export default class SimpleTextEditor implements TextEditor {
  constructor(private text: string[] = [""]) {}
  getText(): string {
    return this.text.join("\n");
  }
  appendText(text: string): void {
    this.insert(text, {
      line: Number.MAX_SAFE_INTEGER,
      col: Number.MAX_SAFE_INTEGER,
    });
  }
  insert(content: string, at: Position): void {
    let targetLine = Math.min(at.line, this.text.length - 1);
    let line = "";
    for (const c of content) {
      if (c === "\n") {
        this.text.splice(targetLine + 1, 0, "");
        this.text[targetLine] = this.text[targetLine] + line;
        targetLine++;
        line = "";
      } else {
        line += c;
      }
    }
    if (line !== "") {
      if (this.text.length < targetLine) {
        this.text[this.text.length - 1] += line;
        return;
      }
      this.text[targetLine] =
        this.text[targetLine].substring(0, at.col) +
        line +
        this.text[targetLine].substring(at.col);
    }
  }
  delete(at: Position): void {
    this.text[at.line] =
      this.text[at.line].slice(0, at.col) +
      this.text[at.line].slice(at.col + 1);
  }

  getContent(): string[] {
    return this.text;
  }
  
  deleteRange(start: Position, end: Position): void {
    let startLine = start.line + 1;
    const endLine = end.line - 1;
    while (startLine <= endLine) {
      this.text.splice(startLine, 1);
      startLine++;
    }
    console.log(start, end);
    if (start.line === end.line) {
      this.text[start.line] =
        this.text[start.line].slice(0, start.col) +
        this.text[start.line].slice(end.col);
    } else {
      this.text[start.line] = this.text[start.line].slice(0, start.col);
      this.text[end.line] = this.text[end.line].slice(end.col);
    }
  }
}

const editor = new SimpleTextEditor(["Hello World"]);
// console.log(editor.getText());

editor.appendText("f");
editor.appendText("a");
editor.appendText("a");
console.log(editor.getContent());
