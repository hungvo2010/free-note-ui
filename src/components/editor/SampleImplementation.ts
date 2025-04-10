
  // insert(text: string, position: number): void {
  //   if (this.root === null) {
  //     this.root = new Piece("add", 0, text.length, null);
  //     this.originalText = "";
  //     this.addText = text;
  //     return;
  //   }

  //   let head: Piece | null = this.root;
  //   let originalOffset = 0;
  //   let previous: Piece | null = null;

  //   while (head !== null) {
  //     originalOffset += head.length;
  //     if (position < originalOffset) {
  //       break;
  //     }
  //     previous = head;
  //     head = head.next;
  //   }

  //   const newPiece = new Piece("add", this.addText.length, text.length, head);

  //   if (head !== null) {
  //     const rightPrice = new Piece(
  //       head.sourceType,
  //       head.offset + (head.length - (originalOffset - position)),
  //       originalOffset - position,
  //       head.next
  //     );
  //     head.length = head.length - (originalOffset - position);
  //     if (head.length === 0 && previous === null) {
  //       this.root = newPiece;
  //       newPiece.next = rightPrice;
  //     } else {
  //       newPiece.next = rightPrice;
  //       head.next = newPiece;
  //     }
  //   }

  //   // console.log(head, position, originalOffset, previous);
  //   if (head === null && position >= originalOffset && previous !== null) {
  //     previous.next = newPiece;
  //     newPiece.next = null;
  //   }

  //   this.addText += text;
  // }

  // delete(start: number, end: number): void {
  //   let head: Piece | null = this.root;
  //   let currentOffset = 0;
  //   let previous: Piece | null = null;
  //   let startPiece: Piece | null = null;
  //   let endPiece: Piece | null = null;

  //   while (head !== null) {
  //     const originalLength = currentOffset + head.length;
  //     if (start >= currentOffset && start < currentOffset + head.length) {
  //       head.length -= start - currentOffset + 1;
  //       head.offset += start - currentOffset + 1;
  //       if (head.length === 0 && previous !== null) {
  //         previous.next = head.next;
  //       }
  //       if (head.length === 0 && previous === null) {
  //         this.root = head.next;
  //       }
  //       startPiece = head;
  //     }
  //     if (
  //       end > start + 1 &&
  //       end >= currentOffset &&
  //       end < currentOffset + head.length - 1
  //     ) {
  //       head.length -= end - currentOffset;
  //       if (head.length === 0 && previous !== null) {
  //         previous.next = head.next;
  //       }
  //       endPiece = head;
  //     }
  //     if (startPiece !== null && endPiece !== null) {
  //       startPiece.next = endPiece.next;
  //       break;
  //     }
  //     previous = head;
  //     currentOffset = originalLength;
  //     head = head.next;
  //   }
  // }