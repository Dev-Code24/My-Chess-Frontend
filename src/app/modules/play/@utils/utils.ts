import { Move, Piece, PieceColor } from "../@interfaces";

export function getTargetPiece(
  targetRow: number,
  targetCol: number,
  allPieces: Piece[],
  piece: Piece
): Piece | null | undefined {
  const targetPiece = allPieces.find(p => p.col === targetCol && p.row === targetRow);
  return targetPiece?.color === piece.color ? null : targetPiece;
}


export function validateMove(
  targetRow: number,
  targetCol: number,
  myColor: PieceColor,
  allPieces: Piece[],
  piece: Piece,
): Move {
  const targetPiece = getTargetPiece(targetRow, targetCol, allPieces, piece);
  if (targetPiece === null) return { valid: false }; // own piece blocks

  const rowDiff = targetRow - piece.row;
  const colDiff = targetCol - piece.col;

  switch (piece.type) {
    case 'pawn': {
      const direction = getPawnDirection(piece.color, myColor);
      const startRow = piece.color === 'w'
        ? (myColor === 'w' ? 6 : 1)
        : (myColor === 'w' ? 1 : 6);

      // single forward
      if (!targetPiece && rowDiff === direction && colDiff === 0) {
        return { valid: true, promotion: targetRow === (piece.color === 'w' ? 0 : 7) };
      }

      // double forward from start
      if (!targetPiece && piece.row === startRow && rowDiff === 2 * direction && colDiff === 0) {
        const midRow = piece.row + direction;
        if (!allPieces.some(p => p.row === midRow && p.col === piece.col)) {
          return { valid: true };
        }
      }

      // capture
      if (targetPiece && rowDiff === direction && Math.abs(colDiff) === 1) {
        return { valid: true, capture: targetPiece };
      }

      return { valid: false };
    }

    case 'rook':
      if (rowDiff === 0 || colDiff === 0) {
        if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) {
          return { valid: true, capture: targetPiece ?? undefined };
        }
      }
      return { valid: false };

    case 'bishop':
      if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) {
          return { valid: true, capture: targetPiece ?? undefined };
        }
      }
      return { valid: false };

    case 'queen':
      if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
        if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) {
          return { valid: true, capture: targetPiece ?? undefined };
        }
      }
      return { valid: false };

    case 'knight':
      if (
        (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
        (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
      ) {
        return { valid: true, capture: targetPiece ?? undefined };
      }
      return { valid: false };

    case 'king':
      if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) {
        return { valid: true, capture: targetPiece ?? undefined };
      }
      // Castling check could be added here
      return { valid: false };

    default:
      return { valid: false };
  }
}

function isPathClear(
  startRow: number,
  startCol: number,
  targetRow: number,
  targetCol: number,
  allPieces: Piece[]
): boolean {
  const rowStep = targetRow === startRow ? 0 : (targetRow > startRow ? 1 : -1);
  const colStep = targetCol === startCol ? 0 : (targetCol > startCol ? 1 : -1);

  let row = startRow + rowStep;
  let col = startCol + colStep;

  while (row !== targetRow || col !== targetCol) {
    if (allPieces.some(p => p.row === row && p.col === col)) return false;
    row += rowStep;
    col += colStep;
  }

  return true;
}


function getPawnDirection(color: PieceColor, myColor: PieceColor): number {
  const whiteStartsAtBottom = myColor === 'w';
  if (color === 'w') {
    return whiteStartsAtBottom ? -1 : 1;
  } else {
    return whiteStartsAtBottom ? 1 : -1;
  }
}
