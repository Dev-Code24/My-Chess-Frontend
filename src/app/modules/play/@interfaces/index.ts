import { BasicApiResponse, RoomDetails } from "@shared/@interface";

export type PieceColor = 'w' | 'b';

export interface Piece {
  id: string;
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: PieceColor
  row: number;
  col: number;
  image: string;
}

export interface RoomDetailsApiResponseAttribute extends RoomDetails { }
export interface RoomDetailsApiResponse extends BasicApiResponse<RoomDetailsApiResponseAttribute> { }
