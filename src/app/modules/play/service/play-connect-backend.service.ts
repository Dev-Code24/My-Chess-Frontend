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

  public initializeConnection(): Observable<void> {
    return this.commonConnectBackend.wsConnect();
  }

  public subscribeToRoom(code: string): Observable<RoomDetails | LiveRoomInfo | string> {
    return this.commonConnectBackend.wsSubscribe<RoomDetails | LiveRoomInfo | string>(`/topic/room.${code}`);
  }

  public postPieceMoves(code: string, pieceMoved: Move): void {
    this.commonConnectBackend.wsSend(`/room/${code}/move`, pieceMoved);
  }

  public disconnect(): void {
    this.commonConnectBackend.wsDisconnect();
  }
}
