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
  if (targetPiece === null) return { valid: false };

  const rowDiff = targetRow - piece.row;
  const colDiff = targetCol - piece.col;
  const response: Move = { valid: false };

  switch (piece.type) {
    case 'pawn': {
      const direction = getPawnDirection(piece.color, myColor);
      const startRow = piece.color === 'w' ? (myColor === 'w' ? 6 : 1) : (myColor === 'w' ? 1 : 6);

      // single forward
      if (!targetPiece && rowDiff === direction && colDiff === 0) {
        if (isSquareAttacked(targetRow, targetCol, myColor, allPieces)) {
          response.reason = 'squareUnderAttack';
        }
        response.valid = true;
        response.promotion = targetRow === (piece.color === 'w' ? 0 : 7);
        return response;
      }

      // double forward from start
      if (!targetPiece && piece.row === startRow && rowDiff === 2 * direction && colDiff === 0) {
        const midRow = piece.row + direction;
        if (!allPieces.some(p => p.row === midRow && p.col === piece.col)) {
          if (isSquareAttacked(targetRow, targetCol, myColor, allPieces)) {
            response.reason = 'squareUnderAttack';
          }
          response.valid = true;
          return response;
        }
      }

      // capture
      if (targetPiece && rowDiff === direction && Math.abs(colDiff) === 1) {
        if (isSquareAttacked(targetRow, targetCol, myColor, allPieces)) {
          response.reason = 'squareUnderAttack';
        }
        response.valid = true;
        response.capture = targetPiece;
        return response;
      }

      // En Passant
      const enPassantRow = myColor === 'b' ? piece.color === 'w' ? 4 : 3 : piece.color === 'w' ? 3 : 4;
      const enPassantTargetCol = piece.col + colDiff;
      if (rowDiff === direction && Math.abs(colDiff) === 1 && targetRow - enPassantRow === direction) {
        const enPassantPawn = allPieces.find(p =>
          p.row === enPassantRow &&
          p.col === enPassantTargetCol &&
          p.type === 'pawn' &&
          p.color !== piece.color &&
          p.enPassantAvailable
        );

        if (enPassantPawn) {
          response.valid = true;
          response.capture = enPassantPawn;
          response.enPassant = true;
          return response;
        }
      }

      return response;
    }

    case 'rook':
      if (rowDiff === 0 || colDiff === 0) {
        if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) {
          if (isSquareAttacked(targetRow, targetCol, myColor, allPieces)) {
            response.reason = 'squareUnderAttack';
          }
          response.valid = true;
          response.capture = targetPiece ?? undefined;
          return response;
        }
      }
      return response;

    case 'knight':
      if (
        (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
        (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
      ) {
        if (isSquareAttacked(targetRow, targetCol, myColor, allPieces)) {
          response.reason = 'squareUnderAttack';
        }
        response.valid = true;
        response.capture = targetPiece ?? undefined;
        return response;
      }
      return response;

    case 'bishop':
      if (Math.abs(rowDiff) === Math.abs(colDiff)) {
        if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) {
          if (isSquareAttacked(targetRow, targetCol, myColor, allPieces)) {
            response.reason = 'squareUnderAttack';
          }
          response.valid = true;
          response.capture = targetPiece ?? undefined;
          return response;
        }
      }
      return response;

    case 'queen':
      if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
        if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) {
          if (isSquareAttacked(targetRow, targetCol, myColor, allPieces)) {
            response.reason = 'squareUnderAttack';
          }
          response.valid = true;
          response.capture = targetPiece ?? undefined;
          return response;
        }
      }
      return response;

    case 'king': {
      // Normal king move
      if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) {
        if (isSquareAttacked(targetRow, targetCol, myColor, allPieces)) {
          return { ...response, valid: false, reason: 'squareUnderAttack' };
        }
        response.valid = true;
        return response;
      }

      // Castling
      if (!piece.hasMoved && rowDiff === 0 && Math.abs(colDiff) === 2) {
        const rookCol = colDiff > 0 ? 7 : 0;  // kingside vs queenside
        const rook = allPieces.find((p) =>
          p.type === 'rook' &&
          p.row === piece.row &&
          p.col === rookCol &&
          p.color === piece.color && !p.hasMoved
        );

        if (!rook) { return response; }

        // Path clear between king and rook?
        const colStep = colDiff > 0 ? 1 : -1;
        let clear = true;
        for (let c = piece.col + colStep; c !== rookCol; c += colStep) {
          if (allPieces.some(p => p.row === piece.row && p.col === c)) {
            clear = false;
            break;
          }
        }
        if (!clear) { return response; }

        if (
          isSquareAttacked(piece.row, piece.col, myColor, allPieces) ||
          isSquareAttacked(piece.row, piece.col + colStep, myColor, allPieces) ||
          isSquareAttacked(piece.row, rookCol, myColor, allPieces)
        ) {
          return { ...response, valid: false, reason: 'kingInCheckDuringCastling' };
        }
        response.valid = true;
        response.castling = colDiff > 0 ? 'kingside' : 'queenside';
        return response;
      }

      return response;
    }

    default:
      return response;
  }
}

export function isSquareAttacked(
  targetRow: number,
  targetCol: number,
  myColor: PieceColor,
  allPieces: Piece[],
): boolean {
  for (const piece of allPieces) {
    if (piece.color === myColor) { continue; }

    const rowDiff = targetRow - piece.row;
    const colDiff = targetCol - piece.col;

    switch (piece.type) {
      case 'pawn': {
        const direction = getPawnDirection(piece.color, myColor);
        if (Math.abs(colDiff) === 1 && rowDiff === direction) { return true; }
        break;
      }

      case 'rook': {
        if (rowDiff === 0 || colDiff === 0) {
          if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) { return true; }
        }
        break;
      }

      case 'knight': {
        if (
          (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
          (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
        ) {
          return true;
        }
        break;
      }

      case 'bishop': {
        if (Math.abs(rowDiff) === Math.abs(colDiff)) {
          if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) { return true; }
        }
        break;
      }

      case 'queen': {
        if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
          if (isPathClear(piece.row, piece.col, targetRow, targetCol, allPieces)) { return true; }
        }
        break;
      }

      case 'king': {
        if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) { return true; }
        break;
      }
    }
  }

  return false;
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
