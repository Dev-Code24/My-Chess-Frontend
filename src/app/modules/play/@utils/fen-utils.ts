import { PieceColor, PieceDetails, PieceType } from "../@interfaces";
import { fenToPieceType } from "./constants";

export function parseFen(fen: string, boardOrientation: 'normal' | 'flip'): { w: PieceDetails[], b: PieceDetails[] } {
  const parts = fen.split(' ');
  const placement = parts[0];
  const rows = placement.split('/');
  const bpieces: PieceDetails[] = [];
  const wpieces: PieceDetails[] = [];

  rows.forEach((row, rowIndex) => {
    let col = 0;
    for (const char of row) {
      const regex = /[1-8]/;
      if (regex.test(char)) {
        col += parseInt(char, 10);
      } else {
        const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
        const type: PieceType = fenToPieceType[char.toLowerCase()];
        const piece = {
          id: `${color}-${type}-${col}`,
          type,
          color,
          row: boardOrientation === 'normal' ? rowIndex : 7 - rowIndex,
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
  return { w: wpieces, b: bpieces };
}

export function isMyTurn(fen: string, myColor: PieceColor): boolean {
  const parts = fen.split(" ");
  return parts[1] === myColor;
}
