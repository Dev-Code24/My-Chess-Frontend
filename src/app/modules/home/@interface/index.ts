import { BasicApiResponse } from "@shared/@interface";

export interface HomeDialog {
  isVisible: boolean;
  formType: 'join' | 'create' | null;
}

export interface JoinRoomApiPayload {
  roomId: string;
}

interface RoomApiResponseAttribute {
  roomId: string;
  whitePlayer: string;
  blackPlayer: string;
}

export interface JoinRoomApiResponse extends BasicApiResponse<RoomApiResponseAttribute> { }
