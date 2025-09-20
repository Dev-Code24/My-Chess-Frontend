import { Piece, PieceColor } from "../@interfaces";

export function getPawnDirection(color: PieceColor, myColor: PieceColor): number {
  const whiteStartsAtBottom = myColor === 'w';
  if (color === 'w') {
    return whiteStartsAtBottom ? -1 : 1;
  } else {
    return whiteStartsAtBottom ? 1 : -1;
  }
}

export function isValidMove(piece: Piece, targetPiece: Piece | undefined | null, myColor: PieceColor, targetRow: number, targetCol: number): Piece | null {
  const rowDiff = targetRow - piece.row;
  const colDiff = targetCol - piece.col;

  switch (piece.type) {
    case 'pawn': {
      const direction = getPawnDirection(piece.color, myColor);
      const startRow = piece.color === 'w' ? (myColor === 'w' ? 6 : 1) : (myColor === 'w' ? 1 : 6);
      // Single forward from start row
      if (!targetPiece && rowDiff === direction && colDiff === 0) { return piece; }
      // Double forward from start row
      if (!targetPiece && piece.row === startRow && rowDiff === 2 * direction && colDiff === 0) { return piece; }
      // Capture
      if (targetPiece && rowDiff === direction && Math.abs(colDiff) === 1) { return targetPiece; }

      return null;
    }

    case 'rook':
      return rowDiff === 0 || colDiff === 0 ? piece : null;

    case 'knight':
      return (
        (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
        (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
      ) ? piece : null;

    case 'bishop':
      return Math.abs(rowDiff) === Math.abs(colDiff) ? piece : null;

    case 'queen':
      return (
        rowDiff === 0 ||
        colDiff === 0 ||
        Math.abs(rowDiff) === Math.abs(colDiff)
      ) ? piece : null;

    case 'king':
      return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1 ? piece : null;

    default:
      return null;
  }
}
