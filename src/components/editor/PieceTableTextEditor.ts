import Piece from "./Piece";
import TextEditor, { Position, Source } from "./TextEditor";

export default class PieceTableTextEditor implements TextEditor {
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
  getText(): string {
    return this.getContent().join("\n");
  }

  /**
   * Appends the given text to the end of the text editor's content.
   *
   * @param text - The text to be appended.
   */
  appendText(text: string): void {
    this.insert(text, { line: Number.MAX_VALUE, col: Number.MAX_VALUE });
  }

  /**
   * Inserts the given content at the specified line and character position in the text editor.
   *
   * @param content - The text to be inserted.
   * @param at - An object specifying the line and character position where the content should be inserted.
   *
   * The function determines the correct piece and offset for insertion by finding the piece corresponding to the specified position.
   * If no piece is found and the root is empty, it creates a new piece with the content. If a piece is found, it splits the piece at
   * the specified offset, inserts the new content, and updates the piece links and lengths accordingly.
   */

  insert(content: string, at: Position): void {
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
  /**
   * Deletes a character at the specified position. If the position is at the
   * beginning of a piece, it merges the pieces. If the position is at the end of
   * a piece, it reduces the length of the piece. If the position is in the middle
   * of a piece, it splits the piece in two.
   * @param at The position to delete the character at.
   */
  delete(at: Position): void {
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
  /**
   * Deletes the text between the two given positions. If the start or end
   * position is outside of a piece, the deletion will be done at the
   * beginning or end of that piece.
   *
   * @param start The start position of the deletion.
   * @param end The end position of the deletion.
   */
  deleteRange(start: Position, end: Position): void {
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

  /**
   * Returns the text as an array of strings, with each string representing
   * a line of text. The lines do not include the newline character at the
   * end.
   *
   * @returns An array of strings, each one representing a line of text.
   */
  getContent(): string[] {
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

  /**
   * Finds the piece that starts the given line, and its offset.
   * If the character is out of the line range, it will return the piece
   * at the end of the line and the offset will be the length of the piece.
   * If the line is out of range, it will return { piece: null, offset: 0, previous: null }
   * @param position The position to find the piece for.
   * @returns An object with the piece that starts the line, the offset in
   * that piece, and the previous piece.
   */
  private findPieceByLine(position: Position): {
    offset: number;
    piece: Piece | null;
    previous: Piece | null;
  } {
    const { line, col } = position;
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

        if (currentLine === line && currentCharacter === col) {
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

  /**
   * Removes the last character of the given piece. If the piece length is
   * reduced to 0, it also removes the piece from the list.
   * @param piece The piece to remove the last character from.
   */
  private removeLastCharacterOfPiece(piece: Piece) {
    piece.length--;

    if (piece.length === 0) {
      this.removePiece(piece);
    }
  }

  /**
   * Removes the given piece from the linked list. This method does not
   * check if the piece is not null or if it is part of the list, it assumes
   * that the piece is valid and part of the list.
   * @param piece The piece to remove from the list.
   */
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

editor.insert("!", { line: 0, col: 0 });
console.log(editor.getContent());

editor.delete({ line: 0, col: 2 });
console.log(editor.getContent());

editor.deleteRange({ line: 0, col: 0 }, { line: 0, col: 5 });
console.log(editor.getContent());
