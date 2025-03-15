import TextEditor, { Position, Source } from "./TextEditor";

class Piece {
  constructor(
    private _offset: number,
    private _length: number,
    private _sourceType: "add" | "original",
    private _next: Piece | null
  ) {}

  get sourceType(): "add" | "original" {
    return this._sourceType;
  }

  get offset(): number {
    return this._offset;
  }

  set offset(offset: number) {
    this._offset = offset;
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
      this.root = new Piece(0, originalText.length, Source.ORIGINAL, null);
    }
    this.originalText = originalText;
    this.addText = addText;
  }

  insert(content: string, at: { line: number; character: number }): void {
    const { piece, offset, previous } = this.findPieceByLine(at);

    if (!piece) {
      if (this.root === null) {
        this.addText += content;
        this.root = new Piece(0, content.length, Source.ADD, null);
        return;
      }

      return;
    }

    const nextPiece = new Piece(
      piece.offset + offset,
      piece.length - offset,
      piece.sourceType,
      piece.next
    );
    const currentPiece = new Piece(
      this.addText.length,
      content.length,
      Source.ADD,
      nextPiece
    );
    this.addText += content;
    piece.length = offset;

    if (previous && piece.length === 0) {
      previous.next = currentPiece;
    } else if (piece.length === 0) {
      this.root = currentPiece;
    } else {
      piece.next = currentPiece;
    }
  }
  delete(at: { line: number; character: number }): void {
    const { piece, offset, previous } = this.findPieceByLine(at);

    if (!piece) {
      return;
    }

    if (offset === 0 && previous) {
      this.removeLastCharacterOfPiece(previous);
      return;
    } else if (offset === 0) {
      // cursor is behind the first character in the text
      return;
    }

    // if the offset and length are equal to 1, the piece needs to be deleted
    if (piece.length === 1 && offset === 1) {
      this.removePiece(piece);
      return;
    }

    if (offset === 1 && piece.length > 0) {
      piece.length--;
      piece.offset++;
      return;
    }

    if (offset === piece.length - 1) {
      piece.length--;
      return;
    }

    // if the removed character is in the middle of a piece,
    // we split it in 2 (reducing the length of the first one and creating a new one)
    const newPiece = new Piece(
      piece.offset + offset,
      piece.length - offset,
      piece.sourceType,
      piece.next
    );

    piece.next = newPiece;
    piece.length = offset - 1;
  }
  deleteRange(
    start: { line: number; character: number },
    end: { line: number; character: number }
  ): void {
    const { piece: startPiece, offset: startOffset } =
      this.findPieceByLine(start);

    const { piece: endPiece, offset: endOffset } = this.findPieceByLine(end);

    if (!startPiece || !endPiece) {
      return;
    }
    if (startPiece === endPiece) {
      // if the range starts at the piece beginning, we move offset

      // to the right and reduce the length

      if (startOffset === 0) {
        endPiece.offset += endOffset;

        endPiece.length -= endOffset;

        return;
      }
    }
    startPiece.length = startOffset;

    endPiece.offset += endOffset;

    endPiece.length -= endOffset;

    let piece = startPiece.next;

    // and remove all the pieces betweens the start one and the end one

    while (piece !== endPiece && piece !== null) {
      startPiece.next = piece.next;

      piece = piece.next;
    }
    if (startPiece.length === 0) {
      this.removePiece(startPiece);
    }

    if (endPiece.length === 0) {
      this.removePiece(endPiece);
    }
  }

  getText(): string[] {
    let head: Piece | null = this.root;
    const lines: string[] = [];
    let line = "";

    while (head !== null) {
      const textSource =
        head.sourceType === Source.ORIGINAL ? this.originalText : this.addText;
      const text = textSource.slice(head.offset, head.offset + head.length);
      for (const char of text) {
        if (char === "\n") {
          lines.push(line);
          line = "";
        } else {
          line += char;
        }
      }
      head = head.next;
    }
    if (line !== "") {
      lines.push(line);
    }
    return lines;
  }

  private findPieceByLine(position: Position): {
    offset: number;
    piece: Piece | null;
    previous: Piece | null;
  } {
    const { line, character } = position;
    let head: Piece | null = this.root;
    let previous: Piece | null = null;
    let currentLine = 0;
    let currentCharacter = 0;

    // searching for the piece that starts the line
    while (head !== null) {
      const source =
        head.sourceType === Source.ORIGINAL ? this.originalText : this.addText;
      const content = source.slice(head.offset, head.offset + head.length);

      for (let i = 0; i < content.length; i++) {
        const letter = content[i];

        if (currentLine === line && currentCharacter === character) {
          return { piece: head, offset: i, previous };
        }

        if (letter === "\n") {
          currentLine++;
          currentCharacter = 0;
        } else {
          currentCharacter++;
        }
      }

      // if nothing found, let the user type in the end
      if (head.next === null) {
        return { piece: head, offset: head.length, previous };
      }

      previous = head;
      head = head.next;
    }

    return { piece: null, offset: 0, previous: null };
  }

  private removeLastCharacterOfPiece(piece: Piece) {
    piece.length--;

    if (piece.length === 0) {
      this.removePiece(piece);
    }
  }

  private removePiece(piece: Piece) {
    let head = this.root;
    let previous = null;

    while (head !== null) {
      if (head === piece) {
        if (previous) {
          previous.next = head.next;
        } else {
          this.root = head.next;
        }
        return;
      }

      previous = head;
      head = head.next;
    }
  }
}

const editor = new PieceTableTextEditor(null, "Hello World", "");
// console.log(editor.getText());

editor.insert("!", { line: 0, character: 0 });
console.log(editor.getText());

editor.delete({ line: 0, character: 2 });
console.log(editor.getText());

editor.deleteRange({ line: 0, character: 0 }, { line: 0, character: 5 });
console.log(editor.getText());
