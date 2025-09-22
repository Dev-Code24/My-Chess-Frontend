import { BasicApiResponse, RoomDetails } from "@shared/@interface";

export type PieceColor = 'w' | 'b';

export interface Piece {
  id: string;
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
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

export interface RoomDetailsApiResponseAttribute extends RoomDetails { }
export interface RoomDetailsApiResponse extends BasicApiResponse<RoomDetailsApiResponseAttribute> { }
