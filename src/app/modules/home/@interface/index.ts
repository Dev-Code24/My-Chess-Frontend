import { BasicApiResponse } from "@shared/@interface";

export interface JoinRoomApiPayload {
  code: string;
}

interface JoinRoomApiResponseAttribute {
  code: string;
}
interface CreateRoomApiResponseAttribute {
  code: string
}

export interface JoinRoomApiResponse extends BasicApiResponse<JoinRoomApiResponseAttribute> { }
export interface CreateRoomApiResponse extends BasicApiResponse<CreateRoomApiResponseAttribute> { }
