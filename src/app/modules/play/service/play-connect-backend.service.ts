import { inject, Injectable } from '@angular/core';
import { RoomDetails } from '@shared/@interface';
import { CommonConnectBackendService } from '@shared/services';
import { Observable } from 'rxjs';
import { LiveMoveDetails, PieceMoved, RoomDetailsApiResponse } from '../@interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlayConnectBackendService {
  private readonly commonConnectBackend = inject(CommonConnectBackendService);

  constructor() { }

  public getRoomDetails(code: string): Observable<RoomDetailsApiResponse> {
    return this.commonConnectBackend.get<RoomDetailsApiResponse>(`/room/${code}`);
  }

  public getLiveRoomDetails(code: string): Observable<RoomDetails | LiveMoveDetails | string> {
    return this.commonConnectBackend.getLive<RoomDetails | LiveMoveDetails | string>(`/room/live/${code}`);
  }

  public postPieceMoves(code: string, pieceMoved: PieceMoved): Observable<any> {
    return this.commonConnectBackend.post<any>(`/room/move/${code}`, pieceMoved);
  }
}
