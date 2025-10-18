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

export interface MoveDetails {
  valid: boolean;
  capture?: Piece | null;
  promotion?: boolean;
  castling?: 'kingside' | 'queenside';
  situation?: 'squareUnderAttack' | 'kingInCheckDuringCastling' | 'doubleStep';
  enPassant?: boolean;
}

export interface Move {
  piece: Piece,
  to: { row: number, col: number };
  targetPiece: Piece | null;
  moveDetails: MoveDetails;
}

export interface LiveRoomInfo {
  moveDetails: Move;
  fen: string;
}

export interface RoomDetailsApiResponseAttribute extends RoomDetails { }
export interface RoomDetailsApiResponse extends BasicApiResponse<RoomDetailsApiResponseAttribute> { }
