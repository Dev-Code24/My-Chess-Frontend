import { BasicApiResponse } from "@shared/@interface";

export interface HomeDialog {
  isVisible: boolean;
  formType: 'join' | 'create' | null;
}

export interface JoinRoomApiPayload {
  code: string;
}

interface JoinRoomApiResponseAttribute {
  code: string;
  whitePlayer: string;
  blackPlayer: string;
}

interface CreateRoomApiResponseAttribute {
  id: string;
  code: string;
  whitePlayer: string;
  blackPlayer: string;
  lastActivity: Date;
  roomStatus: string;
  gameStatus: string;
}

export interface JoinRoomApiResponse extends BasicApiResponse<JoinRoomApiResponseAttribute> { }
export interface CreateRoomApiResponse extends BasicApiResponse<CreateRoomApiResponseAttribute> { }
