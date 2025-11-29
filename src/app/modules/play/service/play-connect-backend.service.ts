import { inject, Injectable } from '@angular/core';
import { RoomDetails } from '@shared/@interface';
import { CommonConnectBackendService } from '@shared/services';
import { Observable } from 'rxjs';
import { LiveRoomInfo, Move, RoomDetailsApiResponse } from '../@interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlayConnectBackendService {
  private readonly commonConnectBackend = inject(CommonConnectBackendService);

  public getRoomDetails(code: string): Observable<RoomDetailsApiResponse> {
    return this.commonConnectBackend.get<RoomDetailsApiResponse>(`/room/${code}`);
  }

  public subscribeToRoom(code: string): Observable<RoomDetails | LiveRoomInfo | string> {
    return this.commonConnectBackend.wsSubscribe<RoomDetails | LiveRoomInfo | string>(`/room.${code}`);
  }

  public postPieceMoves(code: string, pieceMoved: Move): void {
    this.commonConnectBackend.wsSend(`/room/${code}/move`, pieceMoved);
  }

  public joinRoom(code: string): void {
    this.commonConnectBackend.wsSend(`/room/${code}/join`, {});
  }

  public leaveRoom(code: string): Observable<RoomDetailsApiResponse> {
    return this.commonConnectBackend.post<RoomDetailsApiResponse>(`/room/${code}/leave`);
  }
}
