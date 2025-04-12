export default class Piece {
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
