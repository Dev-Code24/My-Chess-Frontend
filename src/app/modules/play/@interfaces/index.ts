import { BasicApiResponse, RoomDetails } from "@shared/@interface";

export type PieceColor = 'w' | 'b';

type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor
  row: number;
  col: number;
  image: string;
  hasMoved?: boolean;
  enPassantAvailable?: boolean;
}

export interface Move {
  valid: boolean;
  capture?: Piece | null;
  promotion?: boolean;
  castling?: 'kingside' | 'queenside';
  reason?: 'squareUnderAttack' | 'kingInCheckDuringCastling';
  enPassant?: boolean;
}

export interface PieceApiPayload {
  id: string;
  type: PieceType;
  color: PieceColor;
  position: { row: number, col: number },
}
export interface PieceMoved {
  piece: Pick<Piece, 'id' | 'col' | 'row' | 'color' | 'type'>;
  to: { row: number, col: number };
  targetPiece: Pick<Piece, 'id' | 'col' | 'row' | 'color' | 'type'> | null;
}

export interface RoomDetailsApiResponseAttribute extends RoomDetails { }
export interface RoomDetailsApiResponse extends BasicApiResponse<RoomDetailsApiResponseAttribute> { }
