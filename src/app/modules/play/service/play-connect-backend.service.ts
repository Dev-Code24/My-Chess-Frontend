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

  constructor() { }

  public getRoomDetails(code: string): Observable<RoomDetailsApiResponse> {
    return this.commonConnectBackend.get<RoomDetailsApiResponse>(`/room/${code}`);
  }

  public getLiveRoomDetails(code: string): Observable<RoomDetails | LiveRoomInfo | string> {
    return this.commonConnectBackend.getLive<RoomDetails | LiveRoomInfo | string>(`/room/live/${code}`);
  }

  public postPieceMoves(code: string, pieceMoved: Move): Observable<any> {
    return this.commonConnectBackend.post<any>(`/room/move/${code}`, pieceMoved);
  }
}
