import TextEditor from "./TextEditor";

class Piece {
  constructor(
    private _sourceType: "add" | "original",
    private _offset: number,
    private _length: number,
    private _next: Piece | null
  ) {}

  get sourceType(): "add" | "original" {
    return this._sourceType;
  }

  get offset(): number {
    return this._offset;
  }

  get next(): Piece | null {
    return this._next;
  }

  set next(next: Piece | null) {
    this._next = next;
  }

  get length(): number {
    return this._length;
  }

  set length(length: number) {
    this._length = length;
  }
}

class PieceTableTextEditor implements TextEditor {
  constructor(
    private root: Piece | null,
    private originalText: string,
    private addText: string
  ) {
    if (root !== null) {
      this.root = root;
    } else {
      this.root = new Piece("original", 0, originalText.length, null);
    }
    this.originalText = originalText;
    this.addText = addText;
  }
  append(text: string): void {
    this.insert(text, this.originalText.length + this.addText.length);
  }
  insert(text: string, position: number): void {
    if (this.root === null) {
      this.root = new Piece("add", 0, text.length, null);
      this.originalText = "";
      this.addText = text;
      return;
    }

    let head: Piece | null = this.root;
    let originalOffset = 0;
    let previous: Piece | null = null;

    while (head !== null) {
      originalOffset += head.length;
      if (position < originalOffset) {
        break;
      }
      previous = head;
      head = head.next;
    }

    const newPiece = new Piece("add", this.addText.length, text.length, head);

    if (head !== null) {
      const rightPrice = new Piece(
        "original",
        head.offset + (head.length - (originalOffset - position)),
        originalOffset - position,
        head.next
      );
      head.length = head.length - (originalOffset - position);
      newPiece.next = rightPrice;
      head.next = newPiece;
    }

    // console.log(head, position, originalOffset, previous);
    if (head === null && position >= originalOffset && previous !== null) {
      previous.next = newPiece;
      newPiece.next = null;
    }

    this.addText += text;
  }

  delete(start: number, end: number): void {
    let head: Piece | null = this.root;
    let currentOffset = 0;
    let previous: Piece | null = null;
    let startPiece: Piece | null = null;
    let endPiece: Piece | null = null;

    while (head !== null) {
      if (start >= currentOffset && start < currentOffset + head.length) {
        head.length = head.length - (currentOffset + head.length - end);
        startPiece = head;
      }
      if (end >= currentOffset && end < currentOffset + head.length) {
        head.length = head.length - (currentOffset + head.length - end);
        endPiece = head;
      }
      previous = head;
      currentOffset += head.length;
      head = head.next;
    }

    if (startPiece !== null && endPiece !== null) {
      startPiece.next = endPiece.next;
    }
  }

  getText(): string {
    let head: Piece | null = this.root;
    let result = "";
    while (head !== null) {
      const textSource =
        head.sourceType === "original" ? this.originalText : this.addText;
      result += textSource.slice(head.offset, head.offset + head.length);
      head = head.next;
    }
    return result;
  }
}

const editor = new PieceTableTextEditor(null, "Hello World", "");
console.log(editor.getText());

editor.insert("!", 12);
console.log(editor.getText());

editor.insert(",", 5);
console.log(editor.getText());

editor.insert("!", 4);
console.log(editor.getText());
