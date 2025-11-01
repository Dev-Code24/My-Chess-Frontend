import { PieceColor, PieceDetails, PieceType } from "../@interfaces";
import { fenToPieceType } from "./constants";

export function parseFen(fen: string, boardOrientation: 'normal' | 'flip'): { w: PieceDetails[], b: PieceDetails[] } {
  const parts = fen.split(' ');
  const placement = parts[0];
  const enPassantField = parts[3];
  const rows = placement.split('/');
  const bpieces: PieceDetails[] = [];
  const wpieces: PieceDetails[] = [];

  rows.forEach((row, index) => {
    let col = 0;
    const rowIndex = boardOrientation === 'normal' ? index : 7 - index;
    for (const char of row) {
      const regex = /[1-8]/;
      if (regex.test(char)) {
        col += parseInt(char, 10);
      } else {
        const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
        const type: PieceType = fenToPieceType[char.toLowerCase()];
        const piece: PieceDetails = {
          id: `${color}-${type}-${index}-${col}`,
          type,
          color,
          row: rowIndex,
          col,
          hasMoved: false,
          image: `/${color}${type === 'knight' ? 'n' : type.charAt(0)}.png`,
        };

        if (color === 'b') { bpieces.push(piece); }
        else { wpieces.push(piece); }

        col++;
      }
    }
  });

  if (enPassantField && enPassantField !== "-") {
    const col = enPassantField.charCodeAt(0) - "a".charCodeAt(0);
    const rank = parseInt(enPassantField[1], 10);
    const targetRow = 8 - rank;

    const adjustedRow =
      boardOrientation === "flip" ? 7 - targetRow : targetRow;

    let pawn =
      wpieces.find((p) => p.type === "pawn" && p.col === col && p.row === adjustedRow) ||
      bpieces.find((p) => p.type === "pawn" && p.col === col && p.row === adjustedRow);

    if (pawn) pawn.enPassantAvailable = true;
  }

  return { w: wpieces, b: bpieces };
}

export function isMyTurn(fen: string, myColor: PieceColor): boolean {
  const parts = fen.split(" ");
  return parts[1] === myColor;
}
