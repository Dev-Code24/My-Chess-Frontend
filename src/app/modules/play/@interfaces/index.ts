import { BasicApiResponse, RoomDetails } from "@shared/@interface";

export type PieceColor = 'w' | 'b';

export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';

export interface Piece {
  id: string;
  type: PieceType;
  color: PieceColor
  row: number;
  col: number;
  hasMoved: boolean;
  enPassantAvailable?: boolean;
}

export interface CapturedPieceDetails {
  type: PieceType;
  color: PieceColor;
  count: number;
  image: string;
}

export interface PieceDetails extends Piece {
  image: string;
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
  piece: Piece,
  to: { row: number, col: number };
  targetPiece: Piece | null;
  move: Move;
}

export interface RoomDetailsApiResponseAttribute extends RoomDetails { }
export interface RoomDetailsApiResponse extends BasicApiResponse<RoomDetailsApiResponseAttribute> { }
