import { inject, Injectable } from '@angular/core';
import { RoomDetails } from '@shared/@interface';
import { CommonConnectBackendService } from '@shared/services';
import { Observable } from 'rxjs';
import { RoomDetailsApiResponse } from '../@interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlayConnectBackendService {
  private readonly commonConnectBackend = inject(CommonConnectBackendService);

  constructor() { }

  public getRoomDetails(code: string): Observable<RoomDetailsApiResponse> {
    return this.commonConnectBackend.get<RoomDetailsApiResponse>(`/room/${code}`);
  }

  public getLiveRoomDetails(code: string): Observable<RoomDetails | string> {
    return this.commonConnectBackend.getLive<RoomDetails | string>(`/room/live/${code}`);
  }
}
